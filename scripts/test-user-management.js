// 测试用户管理功能
const testUserManagement = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 开始测试用户管理功能...\n')

  try {
    // 1. 测试管理员登录
    console.log('1. 测试管理员登录...')
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    })
    
    const loginResult = await loginResponse.json()
    if (!loginResult.success) {
      console.log('❌ 管理员登录失败:', loginResult.message)
      return
    }
    
    const token = loginResult.data.token
    console.log('✅ 管理员登录成功')

    // 2. 测试获取个人资料
    console.log('\n2. 测试获取个人资料...')
    const profileResponse = await fetch(`${baseUrl}/api/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    const profileResult = await profileResponse.json()
    if (profileResult.success) {
      console.log('✅ 获取个人资料成功:', profileResult.data.name)
    } else {
      console.log('❌ 获取个人资料失败:', profileResult.message)
    }

    // 3. 测试创建新用户
    console.log('\n3. 测试创建新用户...')
    const createUserResponse = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: '测试用户',
        email: 'test@example.com',
        password: 'test123',
        role: 'USER',
        phone: '13800138000'
      })
    })
    
    const createResult = await createUserResponse.json()
    if (createResult.success) {
      console.log('✅ 创建用户成功:', createResult.data.name)
      
      // 4. 测试重置密码
      console.log('\n4. 测试重置密码...')
      const resetResponse = await fetch(`${baseUrl}/api/users/${createResult.data.id}/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      const resetResult = await resetResponse.json()
      if (resetResult.success) {
        console.log('✅ 重置密码成功')
      } else {
        console.log('❌ 重置密码失败:', resetResult.message)
      }

      // 5. 测试用户登录
      console.log('\n5. 测试用户登录...')
      const userLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123456' // 重置后的密码
        })
      })
      
      const userLoginResult = await userLoginResponse.json()
      if (userLoginResult.success) {
        console.log('✅ 用户登录成功')
        
        const userToken = userLoginResult.data.token
        
        // 6. 测试用户修改个人信息
        console.log('\n6. 测试用户修改个人信息...')
        const updateProfileResponse = await fetch(`${baseUrl}/api/auth/profile`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({
            name: '测试用户（已修改）',
            phone: '13900139000'
          })
        })
        
        const updateResult = await updateProfileResponse.json()
        if (updateResult.success) {
          console.log('✅ 修改个人信息成功')
        } else {
          console.log('❌ 修改个人信息失败:', updateResult.message)
        }

        // 7. 测试用户修改密码
        console.log('\n7. 测试用户修改密码...')
        const changePasswordResponse = await fetch(`${baseUrl}/api/auth/change-password`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({
            currentPassword: '123456',
            newPassword: 'newpassword123'
          })
        })
        
        const changePasswordResult = await changePasswordResponse.json()
        if (changePasswordResult.success) {
          console.log('✅ 修改密码成功')
        } else {
          console.log('❌ 修改密码失败:', changePasswordResult.message)
        }
      } else {
        console.log('❌ 用户登录失败:', userLoginResult.message)
      }
    } else {
      console.log('❌ 创建用户失败:', createResult.message)
    }

    console.log('\n🎉 用户管理功能测试完成！')
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  }
}

// 运行测试
testUserManagement() 