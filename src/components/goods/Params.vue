<template>
  <div>
    <!-- 面包屑导航区域 -->
   <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
    <!-- 头部的警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" 
      :closable="false" show-icon>
      </el-alert>

    <!-- 选择商品分类区域 -->
    <el-row class="cat_opt">
      <el-col>
        <span>选择商品分类</span>
        <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            :options="catelist"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="handleChange">
          </el-cascader>
      </el-col>
    </el-row>
    <!-- tab 页签区域 -->
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
    <!-- 添加动态参数的面板 -->
      <el-tab-pane label="动态参数" name="many">
      <!-- 添加参数的按钮 -->
        <el-button type="primary" size="mini" 
        :disabled="isBtnDisabled" 
        @click="addDialogVisible=true">添加参数</el-button>
        <!-- 动态参数表格 -->
        <el-table :data="manyTableData" border stripe>
          <!-- 展开行 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <!-- 循环渲染Tag标签 -->
              <el-tag closable v-for="(item, index) in scope.row.attr_vals" 
                :key="index" closable @close="handleClosed(index, scope.row)" > 
              {{ item }}</el-tag>

              <!-- 输入文本框 -->
              <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                 v-model="scope.row.inputValue" 
                 ref="saveTagInput"
                 size="small"
                 @keyup.enter.native="handleInputConfirm(scope.row)"
                 @blur="handleInputConfirm(scope.row)">
              </el-input>
              <!-- 添加按钮 -->
             <el-button v-else class="button-new-tag" 
              size="small" @click="showInput(scope.row)">+ New Tag</el-button>

            </template>

          </el-table-column>
        <!-- 索引列 -->
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column type="参数名称" prop="attr_name"></el-table-column>
          <el-table-column type="操作">
            <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" 
            @click="showEditDialog(scope.row.attr_id)" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete"
             @click="removeParams(scope.row.attr_id)" size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-tab-pane>

    <!-- 添加静态属性的面板 -->
      <el-tab-pane label="静态属性" name="only">
      <!-- 添加属性的按钮 -->
        <el-button type="primary" size="mini" 
        :disabled="isBtnDisabled"
        @click="addDialogVisible=true">添加属性</el-button>
         <!-- 静态属性表格 -->
        <el-table :data="onlyTableData" border stripe>
          <!-- 展开行 -->
          <el-table-column type="expand">
          
            <template slot-scope="scope">
              <!-- 循环渲染Tag标签 -->
              <el-tag closable v-for="(item, index) in scope.row.attr_vals" 
                :key="index" closable @close="handleClosed(index, scope.row)" > 
              {{ item }}</el-tag>

              <!-- 输入文本框 -->
              <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                 v-model="scope.row.inputValue" 
                 ref="saveTagInput"
                 size="small"
                 @keyup.enter.native="handleInputConfirm(scope.row)"
                 @blur="handleInputConfirm(scope.row)">
              </el-input>
              <!-- 添加按钮 -->
             <el-button v-else class="button-new-tag" 
              size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </template>

          </el-table-column>
        <!-- 索引列-->
          <el-table-column type="index"></el-table-column>
          <el-table-column type="属性名称" prop="attr_name"></el-table-column>
          <el-table-column type="操作">
            <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit"
             @click="showEditDialog(scope.row.attr_id)" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete"
             @click="removeParams(scope.row.attr_id)"  size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog  :title="'添加' + titleText" width="50%"
       :visible.sync="addDialogVisible" @close="addDialogClosed">
      <!-- 添加参数的对话框 -->
       <el-form :model="addForm" :rules="addFormRules" 
         ref="addFormRef" label-width="100px">
         <el-form-item :label="titleText" prop="attr_name">
           <el-input v-model="addForm.attr_name"></el-input>
         </el-form-item>
       </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
     <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog> 

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName:'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加数据的表单数据对象
      addForm: {
        attr_name: '' 
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [{required: true, message:'请输入参数名称', trigger: 'blur'}]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改的表单数据对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [{required: true, message:'请输入参数名称', trigger: 'blur'}]
      }
     
    }
  },

  created() {
    this.getCateList()
  },

  methods:{
   // 获取所有的商品分类列表
    async getCateList() {
      const {data: res } = await this.$http.get('categories')
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
 
      this.catelist = res.data
      console.log(this.catelist)
    },

    // 级联选择框中的项发生变化，会触发这个框
    handleChange () {
      this.getParamsData()
    },
    // tab 页签点击事件的处理函数
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
      // 获取参数的列表数据
    async getParamsData() {
       // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      
      // 证明选中的是三级分类
      console.log(this.selectedCateKeys)
      // 根据所选分类的 ID ，和当前所处的面板，获取对应的参数
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,
       {params: { sel: this.activeName}})

       if(res.meta.status !== 200) {
        return this.$message.error('请求参数列表失败')
       }

       // 获取Tag的数据分割为数组 
       res.data.forEach(item => {
         item.attr_vals = item.attr_vals ? 
         item.attr_vals.split(' ') : []
         // 控制文本框的显示和隐藏
         item.inputVisible = false
         item.inputValue = ''
       })

       console.log(res.data)
       if(this.activeName === 'many') {
        this.manyTableData = res.data
       }else{
        this.onlyTableData = res.data
       }
       
    },
    // 监听对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮，添加参数 
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,{
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })

        if(res.meta.status !== 201) {
          return this.$message.error('获取参数失败')
        }
        this.getParamsData()
        this.$message.success('添加参数成功!')
        this.addDialogVisible = false
   
      })
    },
   //点击按钮展示修改的对话框
     async showEditDialog(id) {
      // 查询当前参数的信息
       const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
         params: { attr_sel: this.activeName }
       })
       console.log(res)
       if (res.meta.status !== 200) {
         return this.$message.error('获取参数信息失败!')
       }
       this.editForm = res.data
       this.editDialogVisible = true
     },
    
    // 重置修改的表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮修改数据信息
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败!')
        }
        // console.log(res)
        this.$message.success('修改参数成功!')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    async removeParams(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作!')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败!')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 文本框失去焦点和回车触发
    handleInputConfirm(row) {
      console.log('ok')
       if (row.inputValue.trim().length === 0) {
         row.inputValue = ''
         row.inputVisible = false
         return
       }
       // 如果没有return证明内容合法做后续处理
       row.attr_vals.push(row.inputValue.trim())
       row.inputValue = ''
       row.inputVisible = false
       // 需要发送请求,保存
       this.saveAttrVals(row)
    },
    // Tag标签的删除
    handleClosed(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_sel: this.activeName,
        attr_name: row.attr_name,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败!')
      }
      this.$message.success('修改参数项成功!')
    },
    // 点击按钮显示文本输入框
    showInput(row) {
      row.inputVisible = true
      // 自动获取焦点
      // $nextTick 方法作用: 当页面上的元素被重新渲染之后,才会指定回调函数中的代码
       this.$nextTick(_ => {
         this.$refs.saveTagInput.$refs.input.focus()
        })
    }
  },

  computed: {
    // 如果按钮需要被禁用 则返回 true,否则返回 false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的 ID
    cateId() {
      if (this.selectedCateKeys.length == 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    },
  }
}
</script>

<style lang="less" scoped>
.cat_opt{
  margin:15px;
}
.el-tag {
  margin: 5px 10px;
}
.button-new-tag {
  margin: 5px 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin: 5px 10px;
  vertical-align: bottom;
}

</style>