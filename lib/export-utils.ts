import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// 扩展jsPDF类型
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

// Excel导出
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  try {
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(data)
    
    // 设置列宽
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 15 }))
    ws['!cols'] = colWidths
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    
    // 导出文件
    XLSX.writeFile(wb, `${filename}.xlsx`)
    
    return { success: true, message: 'Excel导出成功' }
  } catch (error) {
    console.error('Excel导出失败:', error)
    return { success: false, message: 'Excel导出失败' }
  }
}

// PDF导出
export function exportToPDF(
  data: any[], 
  columns: { header: string; dataKey: string }[],
  filename: string,
  title: string = '数据报表'
) {
  try {
    const doc = new jsPDF()
    
    // 设置中文字体（需要额外配置）
    doc.setFont('helvetica')
    
    // 添加标题
    doc.setFontSize(16)
    doc.text(title, 14, 22)
    
    // 添加导出时间
    doc.setFontSize(10)
    doc.text(`导出时间: ${new Date().toLocaleString('zh-CN')}`, 14, 32)
    
    // 准备表格数据
    const tableData = data.map(item => 
      columns.map(col => item[col.dataKey] || '')
    )
    
    // 添加表格
    doc.autoTable({
      head: [columns.map(col => col.header)],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })
    
    // 保存文件
    doc.save(`${filename}.pdf`)
    
    return { success: true, message: 'PDF导出成功' }
  } catch (error) {
    console.error('PDF导出失败:', error)
    return { success: false, message: 'PDF导出失败' }
  }
}

// 会员数据导出格式化
export function formatMemberDataForExport(members: any[]) {
  return members.map(member => ({
    '会员编号': member.memberNo,
    '姓名': member.name,
    '手机号': member.phone || '',
    '邮箱': member.email || '',
    '会员等级': member.level?.name || '',
    '状态': member.status === 'ACTIVE' ? '正常' : '已过期',
    '积分': member.points,
    '累计消费': `¥${member.totalSpent.toFixed(2)}`,
    '到期时间': member.membershipExpiry ? new Date(member.membershipExpiry).toLocaleDateString('zh-CN') : '',
    '注册时间': new Date(member.createdAt).toLocaleDateString('zh-CN')
  }))
}

// 商品数据导出格式化
export function formatProductDataForExport(products: any[]) {
  return products.map(product => ({
    'SKU': product.sku,
    '商品名称': product.name,
    '分类': product.category?.name || '',
    '成本价': `¥${product.costPrice.toFixed(2)}`,
    '销售价': `¥${product.sellingPrice.toFixed(2)}`,
    '会员价': product.memberPrice ? `¥${product.memberPrice.toFixed(2)}` : '',
    '库存': product.stock,
    '最低库存': product.minStock,
    '状态': product.status === 'ACTIVE' ? '正常' : '停用',
    '创建时间': new Date(product.createdAt).toLocaleDateString('zh-CN')
  }))
}

// 订单数据导出格式化
export function formatOrderDataForExport(orders: any[]) {
  return orders.map(order => ({
    '订单编号': order.orderNo,
    '订单类型': order.type === 'PURCHASE' ? '采购订单' : order.type === 'SALE' ? '销售订单' : '退货订单',
    '供应商/客户': order.supplier?.name || order.member?.name || '',
    '订单金额': `¥${order.totalAmount.toFixed(2)}`,
    '已付金额': `¥${order.paidAmount.toFixed(2)}`,
    '状态': getOrderStatusText(order.status),
    '订单日期': new Date(order.orderDate).toLocaleDateString('zh-CN'),
    '操作员': order.user?.name || '',
    '备注': order.notes || ''
  }))
}

// 财务记录导出格式化
export function formatFinanceDataForExport(records: any[]) {
  return records.map(record => ({
    '记录编号': record.id,
    '类型': record.type === 'INCOME' ? '收入' : '支出',
    '分类': record.category,
    '金额': `¥${record.amount.toFixed(2)}`,
    '描述': record.description,
    '支付方式': record.paymentMethod,
    '关联订单': record.relatedOrderId || '',
    '日期': new Date(record.date).toLocaleDateString('zh-CN')
  }))
}

// 获取订单状态文本
function getOrderStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'PENDING': '待确认',
    'CONFIRMED': '已确认',
    'SHIPPED': '已发货',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

// 通用导出函数
export function exportData(
  data: any[],
  format: 'excel' | 'pdf',
  filename: string,
  options: {
    title?: string
    sheetName?: string
    columns?: { header: string; dataKey: string }[]
  } = {}
) {
  if (format === 'excel') {
    return exportToExcel(data, filename, options.sheetName)
  } else if (format === 'pdf') {
    const columns = options.columns || Object.keys(data[0] || {}).map(key => ({
      header: key,
      dataKey: key
    }))
    return exportToPDF(data, columns, filename, options.title)
  } else {
    return { success: false, message: '不支持的导出格式' }
  }
} 