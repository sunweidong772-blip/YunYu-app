<template>
	<view class="user" :class="AppStyle">
		<view class="header" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar bg-white" :style="{'height': CustomBar + 'px','padding-top':StatusBar + 'px'}">
				<view class="action" @tap="back">
					<text class="cuIcon-back"></text>
				</view>
				<view class="content text-bold" :style="[{top:StatusBar + 'px'}]">
					用户注册
				</view>
				<view class="action">
					
				</view>
			</view>
		</view>
		<view :style="[{padding:NavBar + 'px 10px 0px 10px'}]"></view>
		<view class="user-form">
			<form>
				<view class="cu-form-group">
					<input name="input" v-model="name" placeholder="请输入用户名(必填)"></input>
				</view>
				<view class="cu-form-group">
					<input name="input" v-model="mail" placeholder="请输入邮箱(必填)" type="text"></input>
				</view>
				<view class="cu-form-group" v-if="isEmail>0">
					<input name="input" v-model="code" placeholder="请输入邮箱验证码" maxlength="6"></input>
					<view class="sendcode text-blue" v-if="show" @tap="RegSendCode">发送</view>
					<view class="sendcode text-gray" v-if="!show">{{ times }}s</view>
				</view>
				<view class="cu-form-group pw-group">
					<input name="input" v-model="password" :type="pwdShow ? 'text' : 'password'" placeholder="请输入密码(字母+数字,≥8位)"></input>
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
				<view class="cu-form-group" v-if="isInvite==1">
					<input name="input" v-model="inviteCode" type="text" placeholder="请输入平台邀请码(必填)"></input>
				</view>
				<view class="cu-form-group">
					<input name="input" v-model="referralCode" type="text" placeholder="个人邀请码(选填)"></input>
				</view>
				<captcha-field ref="captcha" v-model="verifyCode" :visible="true" placeholder="请输入图形验证码"></captcha-field>
				<view class="agree-row">
					<view class="agree-check" :class="isAgreed ? 'on' : ''" @tap="isAgreed = !isAgreed">
						<text class="cuIcon-check"></text>
					</view>
					<text class="agree-text">我已阅读并同意</text>
					<text class="agree-link" @tap.stop="toAgreement">《用户协议》</text>
				</view>
				<view class="user-btn flex flex-direction">
					<button class="cu-btn bg-blue margin-tb-sm lg" @tap="userRegister">立即注册</button>
				</view>
			</form>
		</view>
	</view>
</template>

<script>
	import { localStorage } from '../../js_sdk/mp-storage/mp-storage/index.js'
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

				times: 60,
				show: true,
				timer: null,

				name: "",
				mail: "",
				code: "",
				password: "",
				repassword: "",
				isEmail: 1,
				isInvite: 0,
				inviteCode: "",
				referralCode: "",
				verifyCode: "",
				isAgreed: false,
				pwdShow: false,
				pwdShow2: false,
				regGiftCoin: 0,
				regGiftNum: 0,
				urlInviteCode: ""
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
			that.regConfig();
		},
			onLoad(options) {
				var that = this;
				// #ifdef APP-PLUS || MP
				that.NavBar = this.CustomBar;
				// #endif
				that.urlInviteCode = "";
				if (options) {
					if (options.inviteCode) {
						that.urlInviteCode = options.inviteCode;
						that.referralCode = options.inviteCode;
					}
					if (options.referralCode) {
						that.referralCode = options.referralCode;
					}
				}
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
			userRegister() {
				var that = this;
				if (that.name == "" || that.mail == "" || that.password == "" || that.repassword == "") {
					that.toast("请输入正确的参数");
					return false
				}
				if (that.name.indexOf("@") >= 0 || /\s/.test(that.name)) {
					that.toast("用户名不能包含@或空格");
					return false
				}
				if (!that.validateEmail(that.mail)) {
					that.toast("请输入正确的邮箱");
					return false
				}
				if (that.isEmail > 0 && that.code == "") {
					that.toast("请输入邮箱验证码");
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
				if (that.isInvite == 1 && that.inviteCode == "") {
					that.toast("请输入平台邀请码");
					return false
				}
				if (!that.verifyCode || that.verifyCode == "") {
					that.toast("请输入图形验证码");
					return false
				}
				if (!that.isAgreed) {
					that.toast("请阅读并同意用户协议");
					return false
				}
				var data = {
					'name': that.name,
					'code': that.code,
					'password': that.password,
					'mail': that.mail,
					'inviteCode': that.inviteCode,
					'referralCode': that.referralCode,
					'verifyCode': that.verifyCode
				}
				uni.showLoading({
					title: "加载中"
				});
				that.$Net.request({
					url: that.$API.userRegister(),
					data: {
						"params": JSON.stringify(that.$API.removeObjectEmptyKey(data))
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "post",
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
							localStorage.setItem('pendingLoginName', that.name);
							that.afterRegister();
						} else {
							if (that.$refs.captcha) {
								that.$refs.captcha.refresh();
							}
							that.verifyCode = "";
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
			afterRegister() {
				var that = this;
				var finish = function() {
					setTimeout(function() {
						var pages = getCurrentPages();
						if (pages.length > 1) {
							uni.navigateBack({
								delta: 1
							});
						} else {
							uni.redirectTo({
								url: '/pages/user/login'
							});
						}
					}, 800);
				};
				if (that.regGiftCoin == 1 && that.regGiftNum > 0) {
					uni.showModal({
						title: "注册成功",
						content: "赠送 " + that.regGiftNum + " " + that.$API.getCurrencyName(),
						showCancel: false,
						confirmText: "知道了",
						success: function() {
							finish();
						}
					});
				} else {
					finish();
				}
			},
			RegSendCode() {
				var that = this;
				if (that.mail == "") {
					that.toast("请输入邮箱");
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
					url: that.$API.RegSendCode(),
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
			regConfig() {
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
							that.isEmail = that.toInt(cfg.isEmail, 1);
							that.isInvite = that.toInt(cfg.isInvite, 0);
							that.regGiftCoin = that.toInt(cfg.regGiftCoin, 0);
							that.regGiftNum = that.toInt(cfg.regGiftNum, 0);
							if (that.urlInviteCode) {
								if (that.isInvite == 1) {
									that.inviteCode = that.urlInviteCode;
									if (that.referralCode == that.urlInviteCode) {
										that.referralCode = "";
									}
								}
							}
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
			toInt(v, d) {
				var n = parseInt(v, 10);
				return isNaN(n) ? d : n;
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
			},
			toAgreement() {
				uni.navigateTo({
					url: '/pages/user/agreement'
				});
			}
		}
	}
</script>

<style>
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

	@media (max-width: 375px) {
		.sendcode {
			font-size: 26upx;
		}

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
