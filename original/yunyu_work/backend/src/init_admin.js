import bcrypt from 'bcryptjs';
import { query } from './db.js';

async function initAdmin() {
  const username = '1953254964';
  const password = 'swd030602';
  const hash = await bcrypt.hash(password, 12);
  const yunyuId = 'YY00000001';

  // 检查是否已存在
  const exist = await query('SELECT id FROM users WHERE username=$1', [username]);
  if (exist.rows.length > 0) {
    // 更新密码和权限
    await query(`
      UPDATE users SET password_hash=$1, role='admin', admin_role_code='owner',
      display_name='云屿岛主', level=100, status='active' WHERE username=$2
    `, [hash, username]);
    console.log('管理员账号已更新');
  } else {
    await query(`
      INSERT INTO users(username,password_hash,role,admin_role_code,display_name,yunyu_id,level,status)
      VALUES($1,$2,'admin','owner','云屿岛主',$3,100,'active')
    `, [username, hash, yunyuId]);
    console.log('管理员账号创建成功');
  }

  console.log('用户名:', username);
  console.log('密码:', password);
  console.log('权限: 云屿岛主（最高权限）');
  process.exit(0);
}

initAdmin().catch(e => {
  console.error('初始化失败:', e);
  process.exit(1);
});
