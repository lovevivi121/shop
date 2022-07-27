<template>
  <el-container class="home-container">
    <!-- head -->
    <el-header>
      <div>
        <img src="@/assets/heima.png" alt="">
        <span>E-commerce backstage management system</span>
      </div>
      <el-button type="info" @click="logout">Logout</el-button>
    </el-header>
    <!-- page body -->
    <el-container>
      <!-- side-bar -->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <!-- sidebar open or close -->
          <div class="toggle-button" @click="toggleCollapse">
            |||
          </div>
         <el-menu
          :default-active="activePath"
          router
          :collapse="isCollapse"
          :collapse-transition="false"
          :unique-opened="true"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff">
          <!-- first-class navigation -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- the template area of first-class navigation -->
            <template slot="title">
              <!-- icon -->
              <i :class="iconsObj[item.id]"></i>
              <!-- text -->
              <span>{{item.authName}}</span>
            </template>
            <!-- seconde-class navigation -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
              <template slot="title">
              <!-- icon -->
                <i class="el-icon-menu"></i>
                <!-- text -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- the main body of the page which is in the right -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    //生命周期function,created是在刚创建的时候执行的内容
    created() {
      this.getMenuList();
      this.activePath = window.sessionStorage.getItem('activePath');
    },
    data() {
      return {
        //左侧菜单数据
        menulist: [],
        iconsObj: {
          '125': 'iconfont icon-user',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao'
        },
        isCollapse: false,
        //被激活的连接地址
        activePath: ''
      }
    },
    methods: {
      logout() {
        //Clear the token
        window.sessionStorage.clear();
        //Jump to the page of login
        this.$router.push('/login');
        this.$message.success('退出成功');
      },
      //get all menus in the left side
      async getMenuList() {
        //can onli use menus as url because it has been set in main.js that axios.default.baseURL
        const {data: res} = await this.$http.get('menus');
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg);
        //data是个数组，直接赋值给数组没有问题
        this.menulist = res.data;
        console.log(res);
      },
      //click, sidebar open or close
      toggleCollapse() { 
        this.isCollapse = !this.isCollapse;
      },
      saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath=activePath;
      }
    }
  }
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    color: #fff;
    letter-spacing: .2em;
    cursor: pointer;
  }
}
.el-main {
  background-color: #eaedf1;
}
</style>