<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
      <el-card class="box-card">
        <!-- search and add -->
          
          <el-row :gutter="20">
            <el-col :span="7">
              <el-input clearable placeholder="请输入内容"
              v-model="queryInfor.query" @clear="getUserList">
                <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="addDialogVisible = true">
                添加用户
              </el-button>
            </el-col>
          </el-row>

          <!-- 用户列表区域 -->
          <el-table :data="userList" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="状态">
              <template v-slot="scope">
                <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
                </el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template v-slot="scope">
              <!-- 修改按钮 -->
                <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
                <!-- 分配角色按钮 -->
                <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                  <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页区域 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfor.pagenum"
            :page-sizes="[1,2,5,10]"
            :page-size="queryInfor.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
      </el-card>
      <!-- 添加用户对话框 -->
      <el-dialog
        @close="addDialogClose"
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%">
        <!-- 内容主体区 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>  
        <!-- 底部按钮区 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配角色对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="50%"
        @close="setRoleDialogClosed"
        >
        <div>
          <p>当前用户：{{userInfo.username}}</p>
          <p>当前角色：{{userInfo.role_name}}</p>
          <p>分配新角色：
              <el-select v-model="selectedRoleId" placeholder="请选择">
                <el-option
                  v-for="item in roleList"
                  :key="item.id"
                  :label="item.roleName"
                  :value="item.id">
                </el-option>
              </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 邮箱验证规则
    var checkEmail = (rule,value,cb) => {
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if(regEmail.test(value)) return cb()
      cb(new Error('请输入合法邮箱'))
    }
    // 手机号验证规则
    var checkMobile = (rule,value,cb) => {
      const regEmail = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
      if(regEmail.test(value)) return cb()
      cb(new Error('请输入合法手机号'))
    }
    return{
      // get userList
      queryInfor: {
        //get请求需要提交的信息，根据这些信息后台会自动把数据按照规定的结构传来
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          {required: true,message:'请输入用户名', trigger:'blur'},
          {min: 3,max: 10,message:'请用户名的长度在3到10之间',trigger:'blur'}
        ],
        password: [
          {required: true,message:'请输入密码', trigger:'blur'},
          {min: 6,max: 15,message:'请用户名的长度在6到15之间',trigger:'blur'}
        ],
        email: [
          {required: true,message:'请输入邮箱', trigger:'blur'},
          {validator: checkEmail,trigger: 'blur'}
        ],
        mobile: [
          {required: true,message:'请输入手机号', trigger:'blur'},
          {validator: checkMobile,trigger: 'blur'}
        ],
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      roleList: [],
      // 已选中的角色id值
      selectedRoleId: ''


    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList(){
      const {data: res} = await this.$http.get('users',{params: this.queryInfor})
      if(res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res);
    },
    // 监听 pagesize改变的事件
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfor.pagesize = newSize
      //改变了之后要重新获取一下数据！！！
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfor.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关状态的改变
    async userStateChange(userInfo){
      // console.log(userInfo);
      const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if(res.meta.status!==200) {
        userInfo.mg_state=!userInfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听用户对话框关闭的事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户预验证
    addUser() {
      this.$refs.addFormRef.validate(async (isvalid, unvalid) => {
        if(!isvalid) return 
        // 发起请求
        const {data: res} = await this.$http.post('users',this.addForm)
        if(res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getUserList()
        // console.log(isvalid);
        // this.$message.error(`${unvalid.message}`)
      })
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      //在展示对话框之前，获取所有角色的列表
      const {data: res} = await this.$http.get('roles')
      if(res.meta.status!==200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo() {
      if(!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid: this.selectedRoleId})
      if(res.meta.status!==200) return this.$message.error('更新角色失败')
      this.$message.success('更新角色成功！')
      // 重新获取列表
      this.getUserList()
      this.setRoleDialogVisible=false
    },
    //监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      // 将本次对话框打开获取到的临时存储信息全部清空
      this.selectedRoleId = ''
      this.userInfo = {}
    }

  }
}
</script>

<style lang="less" scoped>

</style>