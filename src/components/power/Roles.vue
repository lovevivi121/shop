<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮area -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe="">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- 栅格系统划分展开后的内容 -->
            <el-row :class="['vcenter','bdbottom',i1 === 0 ? 'bdtop':'']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeRightById(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row :class="['vcenter',i2 === 0 ? '':'bdtop']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag @close="removeRightById(scope.row,item2.id)" closable type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag closable type="warning" v-for="(item3) in item2.children" :key="item3.id"
                    @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scoped.row}}
            </pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
  <el-dialog
    title="分配权限"
    :visible.sync="setRightDialogVisible"
    width="50%">
    <!-- 树形控件 -->
    <el-tree ref="treeRef" node-key="id" default-expand-all show-checkbox :data="rightList" :props="defaultProps" :default-checked-keys="defkeys"></el-tree>
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
        roleList: [],
        //显示对话框的flag
        setRightDialogVisible: false,
        // 所有权限的数组
        rightList: [],
        // 树形控件的绑定对象
        defaultProps: {
          children: 'children',
          label: 'authName'
        },
        // 默认选中的节点id值数组
        defkeys: [105,116]
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      async getRolesList() {
       const {data: res} = await this.$http.get('roles')
       if(res.meta.status!==200) return this.$message.error('获取角色列表失败!')
       this.roleList=res.data
      //  console.log(res.data);
      },
      // according to id to delete rights
      async removeRightById(role,rightId) {
        // alert to hint user wheather to remove the right
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(confirmResult!== 'confirm') return this.$message.info('取消了删除')
        // this.$message.success('已删除')
        // 在后续的操作中发起删除的业务请求
        const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status!==200) return this.$message.error('删除权限失败！')
        role.children = res.data

      },
      // 展示分配权限的对话框
      async showSetRightDialog(role) {
        // 获取所有权限数据
        const {data:res} = await this.$http.get('rights/tree')
        if(res.meta.status!==200) return this.$message.error('获取权限列表失败')
        this.rightList=res.data
        // console.log(this.rightList)
        this.defkeys=[]
        this.getLeafKeys(role,this.defkeys)
        // 打开对话框
        this.setRightDialogVisible = !this.setRightDialogVisible

      },
      // 通过递归的形式获取角色下所有三级权限的id，并保存到defKeys数组当中
      getLeafKeys(node,arr) {
        if(!node.children) {
          // 如果当前node节点不包含children属性，则是三级节点
          return arr.push(node.id)
        }
        node.children.forEach(item => {
          this.getLeafKeys(item,arr)
        });
      },
      allotRights() {
        // 展开运算符，用于合并数组，否则数组有一个[]挡住
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join()
      }
    }
  }
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>