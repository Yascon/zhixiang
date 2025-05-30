#!/usr/bin/env node

/**
 * 智享进销存管理系统 - 部署前检查脚本
 * 检查系统是否准备好部署到生产环境
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始部署前检查...\n');

const checks = [];

// 检查必要文件
function checkRequiredFiles() {
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'prisma/schema.prisma',
    'app/layout.tsx',
    'app/api/auth/login/route.ts',
  ];

  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} 存在`);
    } else {
      console.log(`❌ ${file} 缺失`);
      allFilesExist = false;
    }
  });

  checks.push({
    name: '必要文件检查',
    passed: allFilesExist
  });
}

// 检查环境变量
function checkEnvironmentVariables() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET'
  ];

  let allEnvVarsSet = true;
  
  console.log('\n📋 环境变量检查:');
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} 已设置`);
    } else {
      console.log(`❌ ${envVar} 未设置`);
      allEnvVarsSet = false;
    }
  });

  checks.push({
    name: '环境变量检查',
    passed: allEnvVarsSet
  });
}

// 检查依赖
function checkDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      'next',
      'react',
      'prisma',
      '@prisma/client',
      'antd',
      'bcryptjs',
      'jsonwebtoken'
    ];

    let allDepsInstalled = true;
    
    console.log('\n📦 依赖检查:');
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        console.log(`✅ ${dep} 已安装`);
      } else {
        console.log(`❌ ${dep} 未安装`);
        allDepsInstalled = false;
      }
    });

    checks.push({
      name: '依赖检查',
      passed: allDepsInstalled
    });
  } catch (error) {
    console.log('❌ 无法读取 package.json');
    checks.push({
      name: '依赖检查',
      passed: false
    });
  }
}

// 检查构建配置
function checkBuildConfiguration() {
  try {
    const nextConfig = require('../next.config.js');
    let configValid = true;
    
    console.log('\n⚙️ 构建配置检查:');
    
    if (nextConfig.output === 'standalone') {
      console.log('✅ 输出模式配置正确');
    } else {
      console.log('⚠️ 建议设置 output: "standalone" 用于生产部署');
    }

    if (nextConfig.compress) {
      console.log('✅ 压缩已启用');
    } else {
      console.log('⚠️ 建议启用压缩');
    }

    checks.push({
      name: '构建配置检查',
      passed: configValid
    });
  } catch (error) {
    console.log('❌ 无法读取 next.config.js');
    checks.push({
      name: '构建配置检查',
      passed: false
    });
  }
}

// 检查安全配置
function checkSecurityConfiguration() {
  console.log('\n🔒 安全配置检查:');
  
  let securityValid = true;
  
  // 检查JWT密钥强度
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length >= 32) {
    console.log('✅ JWT密钥强度足够');
  } else {
    console.log('❌ JWT密钥过短，建议至少32个字符');
    securityValid = false;
  }

  // 检查生产环境设置
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ 生产环境模式');
  } else {
    console.log('⚠️ 当前非生产环境模式');
  }

  checks.push({
    name: '安全配置检查',
    passed: securityValid
  });
}

// 运行所有检查
function runAllChecks() {
  checkRequiredFiles();
  checkEnvironmentVariables();
  checkDependencies();
  checkBuildConfiguration();
  checkSecurityConfiguration();

  // 总结
  console.log('\n📊 检查结果总结:');
  const passedChecks = checks.filter(check => check.passed).length;
  const totalChecks = checks.length;

  checks.forEach(check => {
    const status = check.passed ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
  });

  console.log(`\n🎯 通过检查: ${passedChecks}/${totalChecks}`);

  if (passedChecks === totalChecks) {
    console.log('\n🎉 所有检查通过！系统已准备好部署。');
    process.exit(0);
  } else {
    console.log('\n⚠️ 部分检查未通过，请修复后再部署。');
    process.exit(1);
  }
}

// 执行检查
runAllChecks(); 