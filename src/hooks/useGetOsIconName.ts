// deprecated 获取操作系统logo的钩子函数

export default function () {
  return (osName: string) => {
    if (osName?.toLowerCase().includes('win')) { // 'win'比windows宽松
      return 'mdi-microsoft-windows'
    } else if (osName?.toLowerCase().includes('centos')) {
      return 'mdi-centos'
    } else if (osName?.toLowerCase().includes('ubuntu')) {
      return 'mdi-ubuntu'
    } else if (osName?.toLowerCase().includes('debian')) {
      return 'mdi-debian'
    } else if (osName?.toLowerCase().includes('fedora')) {
      return 'mdi-fedora'
    } else {
      return ''
    }
  }
}
