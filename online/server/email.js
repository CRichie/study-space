import sdk from 'tencentcloud-sdk-nodejs-ses';

// A verified Tencent SES template must contain the {{code}} variable.
export function createEmail({mode='console'}={}) {
  if (mode === 'console') {
    if (process.env.NODE_ENV === 'production') throw Error('生产环境不能使用控制台邮件模式');
    return async (email, code) => console.log(`[本地测试邮件] ${email} 的验证码：${code}（5 分钟有效）`);
  }
  if (mode !== 'tencent') throw Error('邮件模式必须是 console 或 tencent');
  for (const name of ['TENCENT_SECRET_ID', 'TENCENT_SECRET_KEY', 'TENCENT_SES_FROM', 'TENCENT_SES_TEMPLATE_ID']) {
    if (!process.env[name]) throw Error(`缺少邮件配置 ${name}`);
  }
  const templateId = Number(process.env.TENCENT_SES_TEMPLATE_ID);
  if (!Number.isSafeInteger(templateId) || templateId <= 0) throw Error('邮件模板 ID 必须是正整数');
  const client = new sdk.ses.v20201002.Client({
    credential: {secretId: process.env.TENCENT_SECRET_ID, secretKey: process.env.TENCENT_SECRET_KEY},
    region: process.env.TENCENT_SES_REGION || 'ap-guangzhou',
    profile: {httpProfile: {endpoint: 'ses.tencentcloudapi.com'}}
  });
  return async (email, code) => {
    await client.SendEmail({FromEmailAddress: process.env.TENCENT_SES_FROM, Destination: [email], Subject: '星星学习工作台登录验证码', Template: {TemplateID: templateId, TemplateData: JSON.stringify({code})}});
  };
}
