<template>
	<view class="captcha-field" v-if="visible">
		<view class="cu-form-group captcha-group">
			<input v-model="innerValue" :placeholder="placeholder" maxlength="8" />
			<image class="captcha-img" :src="src" mode="aspectFill" @tap="refresh"></image>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'captchaField',
		props: {
			value: {
				type: String,
				default: ''
			},
			visible: {
				type: Boolean,
				default: true
			},
			placeholder: {
				type: String,
				default: '请输入图形验证码'
			}
		},
		data() {
			return {
				src: '',
				timer: null
			}
		},
		computed: {
			innerValue: {
				get() {
					return this.value
				},
				set(v) {
					this.$emit('input', v)
				}
			}
		},
		watch: {
			visible(val) {
				if (val) {
					this.refresh()
					this.startTtl()
				} else {
					this.stopTtl()
				}
			}
		},
		mounted() {
			if (this.visible) {
				this.refresh()
				this.startTtl()
			}
		},
		beforeDestroy() {
			this.stopTtl()
		},
		methods: {
			refresh() {
				var url = this.$API.getKaptcha()
				this.src = url + '?' + Date.now()
				this.$emit('refresh')
			},
			startTtl() {
				this.stopTtl()
				var that = this
				this.timer = setInterval(function() {
					that.refresh()
				}, 55000)
			},
			stopTtl() {
				if (this.timer) {
					clearInterval(this.timer)
					this.timer = null
				}
			}
		}
	}
</script>

<style>
	.captcha-field {
		width: 100%;
	}

	.captcha-group {
		margin-bottom: 20upx;
		border: solid #f3f3f3 1px;
		min-height: 90upx;
		border-radius: 50upx;
		overflow: hidden;
		box-sizing: border-box;
		padding-right: 8upx;
	}

	.captcha-group input {
		flex: 1;
		min-width: 0;
	}

	.captcha-img {
		width: 160upx;
		height: 70upx;
		border-radius: 8upx;
		flex-shrink: 0;
		margin-left: 16upx;
		background: #f5f5f5;
	}

	@media (min-width: 768px) {
		.captcha-field {
			max-width: 720px;
			margin: 0 auto;
		}
	}
</style>
