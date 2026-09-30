<template>
	<view class="user" :class="AppStyle">
		<view class="header" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar bg-white" :style="{'height': CustomBar + 'px','padding-top':StatusBar + 'px'}">
				<view class="action" @tap="back">
					<text class="cuIcon-back"></text>
				</view>
				<view class="content text-bold" :style="[{top:StatusBar + 'px'}]">
					用户登录
				</view>
				<!--  #ifdef H5 || APP-PLUS -->
				<view class="action" @tap="toRegister">
					<text>注册</text>
				</view>
				<!--  #endif -->
			</view>
		</view>
		<view :style="[{padding:NavBar + 'px 10px 0px 10px'}]"></view>
		<view class="user-form">
			<form>
				<view class="cu-form-group">
					<input name="input" placeholder="用户名/邮箱" v-model="userName"></input>
				</view>
				<view class="cu-form-group pw-group">
					<input name="input" placeholder="用户密码" :type="pwdShow ? 'text' : 'password'" v-model="password"></input>
					<view class="pw-eye" @tap="pwdShow = !pwdShow">
						<text :class="pwdShow ? 'cuIcon-attentionfill' : 'cuIcon-attention'"></text>
					</view>
				</view>
				<captcha-field ref="captcha" v-model="verifyCode" :visible="needCaptcha" placeholder="请输入图形验证码" @refresh="onCaptchaRefresh"></captcha-field>
				<view class="agree-row">
					<view class="agree-check" :class="isAgreed ? 'on' : ''" @tap="isAgreed = !isAgreed">
						<text class="cuIcon-check"></text>
					</view>
					<text class="agree-text">我已阅读并同意</text>
					<text class="agree-link" @tap.stop="toAgreement">《用户协议》</text>
				</view>
				<view class="user-btn flex flex-direction">
					<button class="cu-btn bg-blue margin-tb-sm lg" @tap="login">立即登录</button>
					<!-- #ifdef MP -->
					<button class="cu-btn bg-green margin-tb-sm lg" @tap="toRegister">注册新用户</button>
					<!-- #endif -->
				</view>
			</form>
		</view>
		<!-- #ifdef APP-PLUS -->
		<view class="api-login" :class="[
			{'grid col-1': socialCount === 1},
			{'grid col-2': socialCount === 2},
			{'grid col-3': socialCount === 3}
		]" v-if="socialCount > 0">
			<view class="api-login-box" @tap="toQQlogin" v-if="qqlogin==1">
				<image src="../../static/icon_qq.png"></image>
			</view>
			<view class="api-login-box" @tap="toWexinlogin" v-if="wxlogin==1">
				<image src="../../static/icon_weixin.png"></image>
			</view>
			<view class="api-login-box" @tap="toWeibologin" v-if="wblogin==1">
				<image src="../../static/icon_weibo.png"></image>
			</view>
		</view>
		<!-- #endif -->
		<!-- #ifdef MP-WEIXIN -->
		<view class="api-login" v-if="wxlogin==1">
			<view class="api-login-box" @tap="toWexinlogin">
				<image src="../../static/icon_weixin.png"></image>
			</view>
		</view>
		<!-- #endif -->
		<!-- #ifdef MP-QQ -->
		<view class="api-login" v-if="qqlogin==1">
			<view class="api-login-box" @tap="toQQlogin">
				<image src="../../static/icon_qq.png"></image>
			</view>
		</view>
		<!-- #endif -->
		<view class="user-foget">
			<text @tap="toFoget">忘记密码？</text>
		</view>
	</view>
</template>

<script>
	import {
		localStorage
	} from '../../js_sdk/mp-storage/mp-storage/index.js'
	import captchaField from '@/pages/components/captchaField.vue'
	export default {
		components: {
			captchaField
		},
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				NavBar: this.StatusBar + this.CustomBar,
				AppStyle: this.$store.state.AppStyle,
				userName: "",
				password: "",
				pwdShow: false,
				wxlogin: 0,
				qqlogin: 0,
				wblogin: 0,
				needCaptcha: false,
				verifyCode: "",
				isAgreed: false,
				redirect: "",
				failCount: 0
			}
		},
		computed: {
			socialCount() {
				return (this.qqlogin ? 1 : 0) + (this.wxlogin ? 1 : 0) + (this.wblogin ? 1 : 0)
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
			if (localStorage.getItem('pendingLoginName')) {
				that.userName = localStorage.getItem('pendingLoginName');
				localStorage.removeItem('pendingLoginName');
			}
		},
		onLoad(options) {
			var that = this;
			// #ifdef APP-PLUS || MP
			that.NavBar = this.CustomBar;
			// #endif
			if (options && options.redirect) {
				try {
					that.redirect = decodeURIComponent(options.redirect);
				} catch (e) {
					that.redirect = options.redirect;
				}
			}
			if (localStorage.getItem('loginNeedCaptcha')) {
				that.needCaptcha = true;
				localStorage.removeItem('loginNeedCaptcha');
			}
		},
		mounted() {
			var that = this;
			that.loadRegConfig();
		},
		methods: {
			toast(title) {
				uni.showToast({
					title: title,
					icon: 'none',
					duration: 1500
				})
			},
			ensureAgreed() {
				if (!this.isAgreed) {
					this.toast("请阅读并同意用户协议");
					return false
				}
				return true
			},
			loadRegConfig() {
				var that = this;
				that.$Net.request({
					url: that.$API.regConfig(),
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1 && res.data.data) {
							var cfg = res.data.data;
							that.wxlogin = that.toInt(cfg.showWxLogin, 0);
							that.qqlogin = that.toInt(cfg.showQqLogin, 0);
							that.wblogin = that.toInt(cfg.showWeiboLogin, 0);
						}
					},
					fail: function(res) {}
				})
			},
			toInt(v, d) {
				var n = parseInt(v, 10);
				return isNaN(n) ? d : n;
			},
			onCaptchaRefresh() {
				this.verifyCode = "";
			},
			back() {
				uni.navigateBack({
					delta: 1
				});
			},
			afterLogin() {
				var that = this;
				that.getCID();
				that.mergeUserInfo();
				var go = function() {
					if (that.redirect) {
						var url = that.redirect;
						if (url.indexOf('/pages/home/home') === 0 || url.indexOf('/pages/home/find') === 0 ||
							url.indexOf('/pages/home/square') === 0 || url.indexOf('/pages/home/user') === 0) {
							uni.switchTab({
								url: url.split('?')[0]
							})
						} else {
							uni.reLaunch({
								url: url
							})
						}
						return
					}
					var pages = getCurrentPages();
					if (pages.length > 1) {
						uni.navigateBack({
							delta: 1
						})
					} else {
						uni.switchTab({
							url: '/pages/home/home'
						})
					}
				}
				setTimeout(go, 600)
			},
			mergeUserInfo() {
				var that = this;
				var token = localStorage.getItem('token');
				if (!token) return;
				that.$Net.request({
					url: that.$API.getUserData(),
					data: {
						token: token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1 && res.data.data) {
							try {
								var base = JSON.parse(localStorage.getItem('userinfo') || '{}');
								var extra = res.data.data;
								var merged = Object.assign({}, base, extra);
								if (base.token) merged.token = base.token;
								if (base.uid) merged.uid = base.uid;
								localStorage.setItem('userinfo', JSON.stringify(merged));
							} catch (e) {
								console.log(e)
							}
						}
					},
					fail: function() {}
				})
			},
			getCID() {
				var that = this;
				let cid = ''
				// #ifdef APP-PLUS
				let pinf = plus.push.getClientInfo();
				cid = pinf.clientid;
				if (cid) {
					that.setClientId(cid);
				}
				// #endif
			},
			setClientId(cid) {
				var that = this;
				var token = "";
				if (localStorage.getItem('token')) {
					token = localStorage.getItem('token');
				} else {
					return false;
				}
				that.$Net.request({
					url: that.$API.setClientId(),
					data: {
						"clientId": cid,
						"token": token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1) {

						}
					},
					fail: function(res) {
						uni.showToast({
							title: "网络开小差了哦",
							icon: 'none'
						})
					}
				})
			},
			saveSession(data) {
				localStorage.setItem('userinfo', JSON.stringify(data));
				localStorage.setItem('token', data.token);
			},
			handleLoginRes(res, needLocalCaptcha) {
				var that = this;
				setTimeout(function() {
					uni.hideLoading();
				}, 1000);
				uni.showToast({
					title: res.data.msg,
					icon: 'none'
				})
				var msg = res.data.msg || '';
				if (msg.indexOf('封禁') >= 0) {
					uni.showModal({
						title: "账号受限",
						content: msg,
						showCancel: false,
						confirmText: "知道了"
					});
					return
				}
				if (res.data.code == 1) {
					that.saveSession(res.data.data);
					that.verifyCode = "";
					that.needCaptcha = false;
					that.failCount = 0;
					localStorage.removeItem('loginNeedCaptcha');
					that.afterLogin();
					return
				}
				var data = res.data.data;
				if (data && data.needCaptcha) {
					that.needCaptcha = true;
					that.verifyCode = "";
					return
				}
				if (needLocalCaptcha) {
					that.failCount = (that.failCount || 0) + 1;
					if (that.failCount >= 2) {
						that.needCaptcha = true;
						that.verifyCode = "";
					}
				}
			},
			login() {
				var that = this;
				if (this.password == "" || this.userName == "") {
					that.toast("请输入正确的参数");
					return false
				}
				if (!that.ensureAgreed()) return
				if (that.needCaptcha && (!that.verifyCode || that.verifyCode == "")) {
					that.toast("请输入图形验证码");
					return
				}
				var data = {
					name: this.userName,
					password: this.password,
				}
				if (that.needCaptcha && that.verifyCode) {
					data.verifyCode = that.verifyCode;
				}
				uni.showLoading({
					title: "加载中"
				});
				that.$Net.request({
					url: that.$API.userLogin(),
					data: {
						"params": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "post",
					dataType: 'json',
					success: function(res) {
						that.handleLoginRes(res, true)
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
			toRegister() {
				var that = this;
				uni.navigateTo({
					url: '/pages/user/register'
				});
			},
			toAgreement() {
				uni.navigateTo({
					url: '/pages/user/agreement'
				});
			},
			toFoget() {
				var that = this;
				uni.navigateTo({
					url: '/pages/user/foget'
				});
			},
			toQQlogin() {
				var that = this;
				if (!that.ensureAgreed()) return
				uni.login({
					provider: 'qq',
					success: resp => {
						var js_code = resp.code;
						var access_token = "";
						// #ifdef APP-PLUS
						access_token = resp.authResult.access_token;
						// #endif
						uni.getUserInfo({
							provider: 'qq',
							success: function(infoRes) {
								var formdata = {
									nickName: infoRes.userInfo.nickname,
									appLoginType: "qq",
									headImgUrl: infoRes.userInfo.figureurl_qq_2,
								};
								// #ifdef APP-PLUS
								formdata.openId = infoRes.userInfo.openId;
								formdata.accessToken = access_token,
									formdata.type = "app";
								// #endif
								// #ifdef MP-QQ
								formdata.type = "applets";
								formdata.js_code = js_code;
								// #endif
								uni.showLoading({
									title: "加载中"
								});
								that.$Net.request({
									url: that.$API.userApi(),
									data: {
										"params": JSON.stringify(that.$API
											.removeObjectEmptyKey(formdata))
									},
									header: {
										'Content-Type': 'application/x-www-form-urlencoded'
									},
									method: "get",
									dataType: 'json',
									success: function(res) {
										that.handleLoginRes(res, false)
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
							}
						});
					},
					fail: err => {
						uni.showToast({
							title: '请求出错啦！',
							icon: 'none',
							duration: 3000
						});
						setTimeout(function() {
							uni.hideLoading();
						}, 1000);
					}
				});
			},
			toWexinlogin() {
				var that = this;
				if (!that.ensureAgreed()) return
				uni.login({
					provider: 'weixin',
					success: res => {
						var js_code = res.code;
						uni.getUserInfo({
							provider: 'weixin',
							success: function(infoRes) {
								let formdata = {
									nickName: infoRes.userInfo.nickName,
									appLoginType: "weixin",
									headImgUrl: infoRes.userInfo.avatarUrl,
								};
								// #ifdef APP-PLUS
								formdata.openId = infoRes.userInfo.openId;
								formdata.accessToken = infoRes.userInfo.unionId,
									formdata.type = "app";
								formdata.js_code = js_code;
								// #endif
								// #ifdef MP-WEIXIN
								formdata.type = "applets";
								formdata.js_code = js_code;
								// #endif
								uni.showLoading({
									title: "加载中"
								});
								that.$Net.request({
									url: that.$API.userApi(),
									data: {
										"params": JSON.stringify(that.$API
											.removeObjectEmptyKey(formdata))
									},
									header: {
										'Content-Type': 'application/x-www-form-urlencoded'
									},
									method: "get",
									dataType: 'json',
									success: function(res) {
										that.handleLoginRes(res, false)
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
							}
						});
					},
					fail: err => {
						console.log(err)
						uni.showToast({
							title: '请求出错啦！',
							icon: 'none',
							duration: 3000
						});
						setTimeout(function() {
							uni.hideLoading();
						}, 1000);
					}
				});
			},
			toWeibologin() {
				var that = this;
				if (!that.ensureAgreed()) return
				uni.login({
					provider: 'sinaweibo',
					success: res => {
						var access_token = '';
						access_token = res.authResult.access_token;
						uni.getUserInfo({
							provider: 'sinaweibo',
							success: function(infoRes) {
								var formdata = {
									nickName: infoRes.userInfo.nickname,
									headImgUrl: infoRes.userInfo.avatar_large,
									openId: infoRes.userInfo.id,
									accessToken: access_token,
									appLoginType: 'SINAWEIBO'
								};
								uni.showLoading({
									title: "加载中"
								});
								that.$Net.request({
									url: that.$API.userApi(),
									data: {
										"params": JSON.stringify(that.$API
											.removeObjectEmptyKey(formdata))
									},
									header: {
										'Content-Type': 'application/x-www-form-urlencoded'
									},
									method: "get",
									dataType: 'json',
									success: function(res) {
										that.handleLoginRes(res, false)
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
							}
						});
					},
					fail: err => {
						uni.showToast({
							title: '请求出错啦！',
							icon: 'none',
							duration: 3000
						});
						setTimeout(function() {
							uni.hideLoading();
						}, 1000);
					}
				});
			}
		}
	}
</script>

<style>
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

	.agree-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin: 10upx 8upx 0;
		font-size: 26upx;
		color: #666;
	}

	.agree-check {
		width: 36upx;
		height: 36upx;
		border-radius: 50%;
		border: 2upx solid #ccc;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12upx;
		flex-shrink: 0;
		color: transparent;
		font-size: 24upx;
		box-sizing: border-box;
	}

	.agree-check.on {
		background: #0081ff;
		border-color: #0081ff;
		color: #fff;
	}

	.agree-text {
		color: #666;
	}

	.agree-link {
		color: #0081ff;
	}

	.api-login {
		margin-top: 40upx;
	}

	.api-login-box image {
		width: 80upx;
		height: 80upx;
	}

	@media (max-width: 375px) {
		.agree-row {
			font-size: 24upx;
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
