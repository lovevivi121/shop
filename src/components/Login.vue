<template>
  <div class="login_container">
    <div class="login_box">
      <!-- header -->
      <div class="avatar_box">
        <img src="@/assets/logo.png" alt="">
      </div>
      <!-- the login form -->
      <el-form ref="loginFormRef" class="login_form" :model="loginForm" :rules="loginRules">
        <!-- username -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- password -->
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <!-- the buttons area -->
        <el-form-item class="btns">
          <el-button type="primary"  @click="login">Login</el-button>
          <el-button type="info" @click="resetLoginForm">reset</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
  export default{
    data(){
      return {
        // login form
        loginForm: {
          username: '',
          password: ''
        },
        // form validation rules
        loginRules: {
          // checkout the username is valid or not
          username: [
            { required: true, message: 'Please input user name.', trigger: 'blur' },
            { min: 3, max: 10, message: 'It must be between 3 and 10 characters in length.', trigger: 'blur' }
          ],
          // checkout the password is valid or not
          password: [
            { required: true, message: 'Please enter the login password.', trigger: 'blur' },
            { min: 6, max: 15, message: 'It must be between 6 and 15 characters in length.', trigger: 'blur' }
          ]
        }
      }
    },
    methods:{
      // reset the login form
      resetLoginForm() {
        // console.log(this);
        // 原理是获取表单对象，然后表单对象有官方定义的一些函数
        //$refs是每个vue组件身上都有的属性（内置成员），用于存储DOM元素或组件的引用，默认指向一个空对象
        this.$refs.loginFormRef.resetFields();
      },
      //表单登录预验证
      login() {
        this.$refs.loginFormRef.validate(async valid => {
          // valid is a boolean value,if it's valid, login
          // console.log(valid);
          // it's unvalid
          if(!valid) return;
          // console.log(this);
          // valid
          // const {data: res} = await this.axios.post('login',this.loginForm);
          // // console.log(res);
          // //failed to login
          // if(res.meta.status !== 200) return console.log('error');
          // console.log('succuss');

          //axios by myself
          await this.$http
            .post('login',this.loginForm)
            .then(res=>{
              //the callback of the succuss of login
              // console.log(res);
              if(res.data.meta.status !== 200) {
                //console.log(res.meta.status);it's wrong
                return this.$message.error('Fail to login!');
              }
              this.$message.success('Welcome back!');
              // the opreation after seccessful login
              window.sessionStorage.setItem('token',res.data.data.token);
              this.$router.push("/home");
            })
            .catch(err=>{
              console.log(err);
            })
          
        });
      }
    },
  }
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 30px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);

  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    background-color: #fff;
    //move the head portrait to the middle
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>