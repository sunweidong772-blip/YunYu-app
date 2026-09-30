<template>
	<view class="user" :class="AppStyle">
		<view class="header" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar bg-white" :style="{'height': CustomBar + 'px','padding-top':StatusBar + 'px'}">
				<view class="action" @tap="back">
					<text class="cuIcon-back"></text>
				</view>
				<view class="content text-bold" :style="[{top:StatusBar + 'px'}]">
					找回密码
				</view>
				<view class="action">
					
				</view>
			</view>
		</view>
		<view :style="[{padding:NavBar + 'px 10px 0px 10px'}]"></view>
		<view class="user-form">
			<form>
				<view class="foget-tip">
					<text>请输入注册邮箱获取验证码，再用用户名或邮箱重置密码</text>
				</view>
				<view class="cu-form-group">
					<input name="input" v-model="mail" placeholder="注册邮箱(必填)" type="text"></input>
				</view>
				<view class="cu-form-group">
					<input name="input" v-model="code" placeholder="请输入验证码" maxlength="6"></input>
					<view class="sendcode text-blue" v-if="show" @tap="SendCode">发送</view>
					<view class="sendcode text-gray" v-if="!show">{{ times }}s</view>
				</view>
				<view class="cu-form-group">
					<input name="input" v-model="name" placeholder="用户名或邮箱(必填)"></input>
				</view>
				<view class="cu-form-group pw-group">
					<input name="input" v-model="password" :type="pwdShow ? 'text' : 'password'" placeholder="输入新密码"></input>
					<view class="pw-eye" @tap="pwdShow = !pwdShow">
						<text :class="pwdShow ? 'cuIcon-attentionfill' : 'cuIcon-attention'"></text>
					</view>
				</view>
				<view class="cu-form-group pw-group">
					<input name="input" v-model="repassword" :type="pwdShow2 ? 'text' : 'password'" placeholder="再次输入密码"></input>
					<view class="pw-eye" @tap="pwdShow2 = !pwdShow2">
						<text :class="pwdShow2 ? 'cuIcon-attentionfill' : 'cuIcon-attention'"></text>
					</view>
				</view>
				<view class="user-btn flex flex-direction">
					<button class="cu-btn bg-blue margin-tb-sm lg" @tap="userFoget">确认修改</button>
				</view>
			</form>
		</view>
	</view>
</template>

<script>
	import { localStorage } from '../../js_sdk/mp-storage/mp-storage/index.js'
	export default {
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				NavBar: this.StatusBar + this.CustomBar,
				AppStyle: this.$store.state.AppStyle,

				times: 60,
				show: true,
				timer: null,

				name: "",
				mail: "",
				code: "",
				password: "",
				repassword: "",
				pwdShow: false,
				pwdShow2: false
			}
		},
		onPullDownRefresh() {
			var that = this;
		},
		onShow() {
			var that = this;
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarStyle("dark")
			// #endif
		},
		onLoad() {
			var that = this;
			// #ifdef APP-PLUS || MP
			that.NavBar = this.CustomBar;
			// #endif
		},
		onUnload() {
			if (this.timer) {
				clearInterval(this.timer)
				this.timer = null
			}
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				});
			},
			validatePassword(password) {
				const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
				return regex.test(password);
			},
			validateEmail(mail) {
				return /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/.test(mail);
			},
			toast(title) {
				uni.showToast({
					title: title,
					icon: 'none',
					duration: 1500,
					position: 'bottom'
				});
			},
			userFoget() {
				var that = this;
				if (that.name == "" || that.code == "" || that.password == "" || that.repassword == "") {
					that.toast("请输入正确的参数");
					return false
				}
				if (!that.validatePassword(that.password)) {
					that.toast("密码必须包含字母、数字，且长度不少于8位");
					return false
				}
				if (that.password != that.repassword) {
					that.toast("两次密码不一致");
					return false
				}
				var data = {
					'name': that.name,
					'code': that.code,
					'password': that.password,
				}
				uni.showLoading({
					title: "加载中"
				});
				that.$Net.request({
					url: that.$API.userFoget(),
					data: {
						"params": JSON.stringify(that.$API.removeObjectEmptyKey(data))
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						setTimeout(function() {
							uni.hideLoading();
						}, 1000);
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						})
						if (res.data.code == 1) {
							setTimeout(function() {
								that.back();
							}, 800);
						}
					},
					fail: function(res) {
						setTimeout(function() {
							uni.hideLoading();
						}, 1000);
						uni.showToast({
							title: "网络开小差了哦",
							icon: 'none'
						})
						uni.stopPullDownRefresh()
					}
				})
			},
			SendCode() {
				var that = this;
				if (that.mail == "") {
					that.toast("请输入注册邮箱");
					return false
				}
				if (!that.validateEmail(that.mail)) {
					that.toast("请输入正确的邮箱");
					return false
				}
				var data = {
					'mail': that.mail
				}
				uni.showLoading({
					title: "加载中"
				});
				that.$Net.request({
					url: that.$API.FogetSendCode(),
					data: {
						"params": JSON.stringify(that.$API.removeObjectEmptyKey(data))
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						setTimeout(function() {
							uni.hideLoading();
						}, 1000);
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						})
						if (res.data.code == 1) {
							that.getCode();
							if (!that.name) {
								that.name = that.mail;
							}
						}
					},
					fail: function(res) {
						setTimeout(function() {
							uni.hideLoading();
						}, 1000);
						uni.showToast({
							title: "网络开小差了哦",
							icon: 'none'
						})
						uni.stopPullDownRefresh()
					}
				})
			},
			getCode() {
				var that = this;
				if (that.timer) {
					clearInterval(that.timer)
					that.timer = null
				}
				that.show = false
				that.times = 60
				that.timer = setInterval(function() {
					that.times--
					if (that.times === 0) {
						that.show = true
						clearInterval(that.timer);
						that.timer = null
						that.times = 60;
					}
				}, 1000)
			}
		}
	}
</script>

<style>
	.foget-tip {
		margin: 0 8upx 20upx;
		color: #999;
		font-size: 24upx;
		line-height: 1.5;
	}

	.sendcode {
		flex-shrink: 0;
		padding: 0 10upx;
		font-size: 28upx;
	}

	.pw-group {
		position: relative;
	}

	.pw-eye {
		flex-shrink: 0;
		width: 70upx;
		text-align: center;
		color: #999;
		font-size: 36upx;
	}

	@media (max-width: 375px) {
		.foget-tip {
			font-size: 22upx;
		}

		.sendcode {
			font-size: 26upx;
		}
	}

	@media (min-width: 768px) {
		.user-form {
			max-width: 720px;
			margin-left: auto;
			margin-right: auto;
		}
	}
</style>
