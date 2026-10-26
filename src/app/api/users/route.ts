import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { Role, UserStatus } from '@/types';

// GET all users (Superadmin only)
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Superadmin privileges required' }, { status: 403 });
    }

    const db = getDb();
    // Return users without passwords, but with order count
    const usersWithStats = db.users.map(u => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = u;
      const userOrders = db.orders.filter(o => o.userId === u.id || o.customerEmail === u.email);
      const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);

      return {
        ...safeUser,
        orderCount: userOrders.length,
        totalSpent: Number(totalSpent.toFixed(2)),
      };
    });

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PATCH update user role or status (Superadmin only)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Superadmin privileges required' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, status } = body as { userId: string; role?: Role; status?: UserStatus };

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = getDb();
    const targetUser = db.users.find(u => u.id === userId);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Safety checks:
    // 1. Cannot demote/suspend oneself
    if (session.id === targetUser.id && (role && role !== 'SUPERADMIN' || status === 'SUSPENDED')) {
      return NextResponse.json({ error: 'You cannot demote or suspend your own Superadmin account' }, { status: 400 });
    }

    // 2. Prevent removing the last superadmin
    if (role && role !== 'SUPERADMIN' && targetUser.role === 'SUPERADMIN') {
      const superadminCount = db.users.filter(u => u.role === 'SUPERADMIN' && u.status === 'ACTIVE').length;
      if (superadminCount <= 1) {
        return NextResponse.json({ error: 'Cannot demote the sole active Superadmin' }, { status: 400 });
      }
    }

    const oldRole = targetUser.role;
    const oldStatus = targetUser.status;

    if (role && ['USER', 'ADMIN', 'SUPERADMIN'].includes(role)) {
      targetUser.role = role;
    }

    if (status && ['ACTIVE', 'SUSPENDED'].includes(status)) {
      targetUser.status = status;
    }

    // Log the event
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: 'USER_PRIVILEGE_UPDATE',
      details: `Modified user "${targetUser.name}" (${targetUser.email}): Role ${oldRole} -> ${targetUser.role}, Status ${oldStatus} -> ${targetUser.status}.`,
      createdAt: new Date().toISOString(),
    });

    saveDb(db);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = targetUser;

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: `User permissions updated successfully`,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
