import { PrismaClient, UserRole, BranchType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('❌ DATABASE_URL is missing in environment variables!');
}

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function main(): Promise<void> {
  console.log('🌱 Bắt đầu seeding dữ liệu mẫu...');

  // ─────────────────────────────────────────────
  // 1. Tạo branches
  // ─────────────────────────────────────────────
  const headquarters = await prisma.branch.upsert({
    where: { code: 'HQ' },
    update: {},
    create: {
      name: 'Trụ sở chính',
      code: 'HQ',
      type: BranchType.HEADQUARTERS,
      isActive: true,
    },
  });

  const branchHanoi = await prisma.branch.upsert({
    where: { code: 'HN-01' },
    update: {},
    create: {
      name: 'Chi nhánh Hà Nội',
      code: 'HN-01',
      type: BranchType.BRANCH,
      isActive: true,
    },
  });

  const branchHCM = await prisma.branch.upsert({
    where: { code: 'HCM-01' },
    update: {},
    create: {
      name: 'Chi nhánh Hồ Chí Minh',
      code: 'HCM-01',
      type: BranchType.BRANCH,
      isActive: true,
    },
  });

  console.log(
    `✅ Branches: ${headquarters.name}, ${branchHanoi.name}, ${branchHCM.name}`,
  );

  // ─────────────────────────────────────────────
  // 2. Tạo Director (trụ sở — không thuộc chi nhánh)
  // ─────────────────────────────────────────────
  const directorPassword = await hashPassword('Director@123');

  const director = await prisma.user.upsert({
    where: { email: 'director@nexusflow.vn' },
    update: {},
    create: {
      email: 'director@nexusflow.vn',
      name: 'Nguyễn Văn Giám Đốc',
      password: directorPassword,
      role: UserRole.DIRECTOR,
      isActive: true,
      branchId: null,
    },
  });

  console.log(`✅ Director: ${director.email}`);

  // ─────────────────────────────────────────────
  // 2b. Tạo Admin (ngang quyền Director)
  // ─────────────────────────────────────────────
  const adminPassword = await hashPassword('Admin@123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexusflow.vn' },
    update: {},
    create: {
      email: 'admin@nexusflow.vn',
      name: 'Lý Thị Quản Trị',
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
      branchId: null,
    },
  });

  console.log(`✅ Admin: ${admin.email}`);

  // ─────────────────────────────────────────────
  // 3. Tạo BranchLead cho chi nhánh Hà Nội
  // ─────────────────────────────────────────────
  const branchLeadHanoiPassword = await hashPassword('BranchLead@123');

  const branchLeadHanoi = await prisma.user.upsert({
    where: { email: 'branchlead.hanoi@nexusflow.vn' },
    update: {},
    create: {
      email: 'branchlead.hanoi@nexusflow.vn',
      name: 'Trần Thị Trưởng HN',
      password: branchLeadHanoiPassword,
      role: UserRole.BRANCH_LEAD,
      isActive: true,
      branchId: branchHanoi.id,
    },
  });

  // ─────────────────────────────────────────────
  // 4. Tạo BranchLead cho chi nhánh HCM
  // ─────────────────────────────────────────────
  const branchLeadHCMPassword = await hashPassword('BranchLead@123');

  const branchLeadHCM = await prisma.user.upsert({
    where: { email: 'branchlead.hcm@nexusflow.vn' },
    update: {},
    create: {
      email: 'branchlead.hcm@nexusflow.vn',
      name: 'Lê Văn Trưởng HCM',
      password: branchLeadHCMPassword,
      role: UserRole.BRANCH_LEAD,
      isActive: true,
      branchId: branchHCM.id,
    },
  });

  console.log(
    `✅ BranchLeads: ${branchLeadHanoi.email}, ${branchLeadHCM.email}`,
  );

  // ─────────────────────────────────────────────
  // 5. Tạo Staff cho chi nhánh Hà Nội (3 nhân viên)
  // ─────────────────────────────────────────────
  const staffPassword = await hashPassword('Staff@123');

  const staffHanoiData = [
    {
      email: 'staff1.hanoi@nexusflow.vn',
      name: 'Phạm Thị Nhân Viên HN 1',
    },
    {
      email: 'staff2.hanoi@nexusflow.vn',
      name: 'Hoàng Văn Nhân Viên HN 2',
    },
    {
      email: 'staff3.hanoi@nexusflow.vn',
      name: 'Vũ Thị Nhân Viên HN 3',
    },
  ];

  for (const staffData of staffHanoiData) {
    await prisma.user.upsert({
      where: { email: staffData.email },
      update: {},
      create: {
        email: staffData.email,
        name: staffData.name,
        password: staffPassword,
        role: UserRole.STAFF,
        isActive: true,
        branchId: branchHanoi.id,
      },
    });
  }

  console.log(`✅ Staff Hà Nội: ${staffHanoiData.length} nhân viên`);

  // ─────────────────────────────────────────────
  // 6. Tạo Staff cho chi nhánh HCM (3 nhân viên)
  // ─────────────────────────────────────────────
  const staffHCMData = [
    {
      email: 'staff1.hcm@nexusflow.vn',
      name: 'Ngô Thị Nhân Viên HCM 1',
    },
    {
      email: 'staff2.hcm@nexusflow.vn',
      name: 'Đặng Văn Nhân Viên HCM 2',
    },
    {
      email: 'staff3.hcm@nexusflow.vn',
      name: 'Bùi Thị Nhân Viên HCM 3',
    },
  ];

  for (const staffData of staffHCMData) {
    await prisma.user.upsert({
      where: { email: staffData.email },
      update: {},
      create: {
        email: staffData.email,
        name: staffData.name,
        password: staffPassword,
        role: UserRole.STAFF,
        isActive: true,
        branchId: branchHCM.id,
      },
    });
  }

  // ─────────────────────────────────────────────
  // 7. Tạo danh mục loại yêu cầu động
  // ─────────────────────────────────────────────
  const requestTypes = [
    { code: 'LEAVE', name: 'Nghỉ phép', description: 'Xin nghỉ phép theo ngày hoặc theo đợt' },
    { code: 'EXPENSE', name: 'Hoàn ứng chi phí', description: 'Đề nghị hoàn ứng hoặc thanh toán công tác phí' },
    { code: 'PURCHASE', name: 'Mua sắm', description: 'Đề xuất mua sắm tài sản hoặc vật tư' },
    { code: 'CARD', name: 'Mở thẻ', description: 'Đề nghị mở thẻ cho nhân sự hoặc đối tác' },
    { code: 'CONTRACT', name: 'Phê duyệt hợp đồng', description: 'Trình duyệt hợp đồng nội bộ/đối tác' },
  ];

  for (const type of requestTypes) {
    await prisma.requestType.upsert({
      where: { code: type.code },
      update: {
        name: type.name,
        description: type.description,
        isActive: true,
      },
      create: {
        code: type.code,
        name: type.name,
        description: type.description,
        isActive: true,
      },
    });
  }

  console.log(`✅ Request types: ${requestTypes.length} loại`);

  console.log(`✅ Staff HCM: ${staffHCMData.length} nhân viên`);

  // ─────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────
  console.log('\n📋 Tóm tắt tài khoản mẫu:');
  console.log('─────────────────────────────────────────────────');
  console.log('Role         | Email                              | Password');
  console.log('─────────────────────────────────────────────────');
  console.log(`DIRECTOR     | director@nexusflow.vn              | Director@123`);
  console.log(`ADMIN        | admin@nexusflow.vn                 | Admin@123`);
  console.log(`BRANCH_LEAD  | branchlead.hanoi@nexusflow.vn      | BranchLead@123`);
  console.log(`BRANCH_LEAD  | branchlead.hcm@nexusflow.vn        | BranchLead@123`);
  console.log(`STAFF (HN)   | staff[1-3].hanoi@nexusflow.vn      | Staff@123`);
  console.log(`STAFF (HCM)  | staff[1-3].hcm@nexusflow.vn        | Staff@123`);
  console.log('─────────────────────────────────────────────────');
  console.log('\n✨ Seeding hoàn tất!');
}

main()
  .catch((error: Error) => {
    console.error('❌ Seeding thất bại:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
