<template>
  <div>
   <!-- 面包屑导航区域 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
     </el-breadcrumb>

     <!-- 卡片视图 -->
     <el-card>
     <!-- 添加角色按钮区域 -->
       <el-row>
         <el-col>
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button> 
         </el-col>
       </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
      <!-- 展开列 -->
         <el-table-column type="expand">
           <template slot-scope="scope">
             <el-row :class="['bdbottom',i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1,i1) 
             in scope.row.children" :key="item1.id">
             <!-- 渲染一级权限 -->
               <el-col :span="5">
                 <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                 <i class="el-icon-caret-right"></i>
               </el-col> 

               <!-- 渲染二级和三级权限 -->
               <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染 -->
                 <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                   <el-col :span="6">
                     <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                     <i class="el-icon-caret-right"></i>
                   </el-col>
                   <!-- 三级权限 -->
                   <el-col :span="18">
                     <el-tag type="warning" v-for="(item3) in item2.children" 
                     :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                     {{item3.authName}}
                     </el-tag>
                   </el-col>
                 </el-row>
               </el-col> 
             </el-row>

             <!-- <pre>
             {{scope.row}}
             </pre> -->

           </template>
         </el-table-column>
      <!-- 索引列 -->
        <el-table-column type="index" label="#" ></el-table-column>
        <el-table-column label="角色名称" prop="roleName">
        </el-table-column>
         <el-table-column label="角色描述" prop="roleDesc">
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button 
              size="mini" 
              type="primary" 
              icon="el-icon-edit" 
              @click="showEdiDialog(scope.row.id)">
            编辑</el-button>
            <el-button size="mini"
             type="danger" icon="el-icon-delete" 
             @click="removeRoleById(scope.row.id)">
             删除</el-button>
            <el-button size="mini" type="warning" 
             icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>

      </el-table>

     </el-card>

     <!-- 添加角色对话框 -->
     <el-dialog 
     title="添加角色"
     :visible.sync="addDialogVisible"
     width="50%" @close="addDialogClosed"
     >
     <!-- 添加角色的信息区域 -->
     <el-form :model="addForm" :rules="addFormRules" ref="loginForm" label-width="70px">
     <!-- 角色名字设置 -->
       <el-form-item label="角色名" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
      </el-form-item>
      <!-- 角色描述 -->
      <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
      </el-form-item>

     </el-form>

     <!-- 底部区域 -->
       <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible= false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
       </span>

     </el-dialog>

     <!-- 编辑角色信息 -->
    <el-dialog 
     title="编辑用户" :visible.sync="editDialogVisible"
     width="50%" @close="editDialogClosed" > 
       <!-- 用户名 -->
       <el-form :model="editForm" :rules="editFormRules" 
         ref="editFormRef" label-width="70px">
         <el-form-item label="角色名">
           <el-input v-model="editForm.roleName" ></el-input>
         </el-form-item>
       </el-form>
       <!-- 职位 -->
       <el-form :model="editForm" :rules="editFormRules" 
         ref="editFormRef" label-width="70px">
         <el-form-item label="职位">
           <el-input v-model="editForm.roleDesc" ></el-input>
         </el-form-item>
       </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
         <el-button @click="editDialogVisible = false">取 消</el-button>
         <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>

    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox
       node-key="id" default-expand-all :default-checked-keys="defkeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],

      // 控制修改用户对话框的显示与隐藏
      addDialogVisible: false,
        // 控制修改角色对话框的显示与隐藏
      editDialogVisible:false,
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点ID 值数组
      defkeys: [],
      // 当前即将分配权限的角色 ID
      roleId: '',

      // 添加用户的表单数据
      addForm: {rolesname: '',},
      // 添加角色表单的验证规则对象
      addFormRules: {
         roleName: [
           {required: true, message:'请输入用户名', trigger: 'blur'},
           {min: 3, max: 10, message: '用户名长度在3至10个字符',trigger: 'blur' }
         ],
         roleDesc: [
           {required: true, message:'请输入职位名', trigger: 'blur'},
           {min: 3, max: 10, message: '用户名长度在3至10个字符',trigger: 'blur' }
         ]
      },
    
      // 查询的用户信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        roleName: [
           {required: true, message:'请输入用户名', trigger: 'blur'},
           {min: 3, max: 10, message: '用户名长度在3至10个字符',trigger: 'blur' }
         ],
         roleDesc: [
           {required: true, message:'请输入职位名', trigger: 'blur'},
           {min: 3, max: 10, message: '用户名长度在3至10个字符',trigger: 'blur' }
         ]
       
      }

    }
  },
  
  
  created() {
    this.getRolesList()
  },

  methods: {
    //  获取所有角色的列表
     async getRolesList() {
       const {data: res} = await this.$http.get('roles')

       if(res.meta.status !==200){
         return this.$message.error('获取角色失败列表')
       }

       this.rolelist = res.data

      //  console.log(this.rolelist)
     },

      // 监听用户对话框的关闭事件
      addDialogClosed() {
        this.$refs.loginForm.resetFields()
      },

    // 点击按钮添加角色
    addRole() {
        this.$refs.loginForm.validate(async valid => {
          if (!valid) return
          // 可以发起添加用户的网络请求
          const {data: res} = await this.$http.post
          ('roles',this.addForm)
          if(res.meta.status !== 201) {
            this.$message.error('添加角色失败')
          }

          this.$message.success('添加角色成功!')
          // 隐藏添加的对话框
           this.addDialogVisible  = false
          // 重新获取用户列表数据
           this.getRolesList()
        })
     },

     //  展示编辑用户的对话框
    async showEdiDialog(id) {
        //  console.log(id)
        const {data: res} = await this.$http.get('roles/' + id,)
         if(res.meta.status !== 200) {
          return this.$message.error('查询用户信息失败')
         }
        // console.log(res.meta.status) 
         this.editForm = res.data
         this.editDialogVisible = true
         console.log(this.editForm)
     },

     //  监听修改用户对话框的关闭事件
     editDialogClosed() {
      this.$refs.editFormRef.resetFields()
     },
      //  修改用户信息并提交
    editRoleInfo() {
       this.$refs.editFormRef.validate(async valid=> {
          console.log(valid)
        if (!valid) return
        // 发起修改用户信息的数据请求
        const {data: res} = await this.$http.put('roles/' + this.editForm.roleId,
        {roleName: this.editForm.roleName,
         roleDesc: this.editForm.roleDesc
         })
          console.log(res.meta.status)
           if(res.meta.status !== 200) {
            return this.$message.error('更新用户信息失败')
           }
        //  关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getRolesList()
        // 提示修改成功
        this.$message.success('更新用户数据成功')
       })
     },

     //  根据Id删除对应的用户信息
     async removeRoleById(id) {
      //  console.log(id)
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确定删除，则返回字符串 confirm
        // 如果用户取消删除，则返回字符串 cancel
        // console.log(confirmResult)
        if(confirmResult !== 'confirm') {
          return this.$message.info('已经取消删除')
        }

        const {data: res} = await this.$http.delete('roles/' + id)

        if(res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }

        this.$message.success('删除用户成功')
        this.getRolesList()
     },
    //  根据 ID 删除对应的权限
     async removeRightById(role,rightId) {
      // 弹框提示用户是否删除
       const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm') {
          return this.$message.info('取消了删除！')
        }
        // console.log('确认了删除')
        const {data: res} = await this.$http.delete
        (`roles/${role.id}/rights/${rightId}`)

        if(res.meta.status !== 200) {
          return this.$message.error('删除权限失败')
        }
        
        role.children = res.data
        // this.getRolesList()

     } ,
    //  展示分配权限的对话框
     async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const {data: res} = await this.$http.get('rights/tree')

      if(res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }

      // 把获取到的权限数据保存到 data 中
      this.rightslist = res.data
      // console.log(this.rightslist)

      // 递归获取三级节点的 id
      this.getleafKeys(role, this.defkeys)

      this.setRightDialogVisible = true
     },
    //  通过递归的形式，获取角色下所有三级权限的 id, 并保存到 derkeys 数组中
    getleafKeys(node,arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if(!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getleafKeys(item,arr))
    },
    // 监听分配权限对话框的关闭时间
    setRightDialogClosed() {
      this.defkeys = []
    },
     // 点击为角色分配权限
    async allotRights() {
      const keys = [this.$refs.treeRef.getCheckedKeys(),
        this.$refs.treeRef.getHalfCheckedKeys()
        ]
      
      // console.log(keys)
      const idStr = keys.join(',')

       const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`,
       {rids: idStr })
       
       if(res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
       }
   
       this.$message.success('分配权限成功')
       this.getRolesList()
       this.setRightDialogVisible = false
    },
   
  }
}
</script>

<style lang="less" scoped>

.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee
}

.bdbottom {
  border-bottom: 1px solid #eee
}
.vcenter {
  display:flex;
  align-items: center;
}

</style>