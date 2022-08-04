import Vue from 'vue'
// import { Button } from 'element-ui'
// import { Form, FormItem } from 'element-ui'
// import { input } from 'element-ui' 
// // 导入弹框组件
// import { Message } from 'element-ui'

import { Button, Message, Form, FormItem, input} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(input)
Vue.prototype.$message = Message
