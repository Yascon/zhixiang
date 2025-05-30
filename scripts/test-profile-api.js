// 测试个人资料API
const testProfileAPI = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 测试个人资料API...\n')

  try {
    // 1. 登录获取token
    console.log('1. 管理员登录...')
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    })
    
    const loginResult = await loginResponse.json()
    console.log('登录结果:', loginResult)
    
    if (!loginResult.success) {
      console.log('❌ 登录失败')
      return
    }
    
    const token = loginResult.data.token
    console.log('✅ 登录成功，token:', token.substring(0, 20) + '...')

    // 2. 测试获取个人资料
    console.log('\n2. 获取个人资料...')
    const profileResponse = await fetch(`${baseUrl}/api/auth/profile`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('响应状态:', profileResponse.status)
    const profileResult = await profileResponse.json()
    console.log('个人资料结果:', profileResult)
    
    if (profileResult.success) {
      console.log('✅ 获取个人资料成功')
    } else {
      console.log('❌ 获取个人资料失败:', profileResult.message)
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  }
}

// 运行测试
testProfileAPI() 