<template>
	<view class="activity-detail-page">
		<view class="header" :style="[{ height: CustomBar + 'px' }]">
			<view class="cu-bar bg-white" :style="{ height: CustomBar + 'px', paddingTop: StatusBar + 'px' }">
				<view class="action" @tap="back">
					<text class="cuIcon-back"></text>
				</view>
				<view class="content text-bold" :style="[{ top: StatusBar + 'px' }]">活动详情</view>
				<view class="action"></view>
			</view>
		</view>
		<view :style="[{ padding: NavBar + 'px 0 0 0' }]"></view>

		<scroll-view scroll-y class="detail-scroll">
			<view class="detail-body">
				<view v-if="isLoading" class="detail-skeleton">
					<view class="sk-cover"></view>
					<view class="sk-line w60"></view>
					<view class="sk-line w40"></view>
					<view class="sk-block"></view>
				</view>

				<view v-else-if="!detail" class="empty-box">
					<text class="cuIcon-warn empty-icon"></text>
					<text class="empty-text">活动不存在或已下架</text>
					<view class="empty-btn" @tap="back"><text>返回</text></view>
				</view>

				<block v-else>
					<image v-if="detail.cover" class="detail-cover" :src="detail.cover" mode="widthFix"></image>

					<view class="meta-card">
						<view class="status-chip" :class="detail.status == 1 ? 'on' : 'off'">
							<view class="status-dot"></view>
							<text>{{ detail.status == 1 ? '进行中' : '已结束' }}</text>
						</view>
						<text class="detail-title">{{ detail.title }}</text>
						<view class="detail-time-row">
							<text class="cuIcon-time time-ico"></text>
							<text class="detail-time">{{ formatActivityTime(detail) }}</text>
						</view>
					</view>

					<view class="gap"></view>

					<view class="content-card">
						<mp-html v-if="detail.content" :content="detail.content" :selectable="true"
							:show-img-menu="true" :lazy-load="true" :scroll-table="true" />
						<text v-else class="no-content">暂无详细内容</text>
					</view>
				</block>
				<view class="page-pad"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import mpHtml from '@/components/mp-html/mp-html'
	import {
		localStorage
	} from '../../js_sdk/mp-storage/mp-storage/index.js'

	export default {
		name: 'activityDetail',
		components: {
			mpHtml
		},
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				NavBar: this.StatusBar + this.CustomBar,
				token: '',
				id: 0,
				detail: null,
				isLoading: true
			}
		},
		onLoad(options) {
			this.token = localStorage.getItem('token') || ''
			this.id = parseInt(options && options.id, 10) || 0
			if (!this.id) {
				this.isLoading = false
				return
			}
			this.loadDetail()
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			toast(msg) {
				uni.showToast({
					title: msg || '',
					icon: 'none'
				})
			},
			toInt(v) {
				if (v === null || v === undefined) return 0
				var n = parseInt(v, 10)
				return isNaN(n) ? 0 : n
			},
			pad(n) {
				return n < 10 ? '0' + n : String(n)
			},
			loadDetail() {
				var that = this
				that.isLoading = true
				that.$Net.request({
					url: that.$API.activityDetail(),
					data: {
						token: that.token,
						id: that.id
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: 'post',
					dataType: 'json',
					success: function(res) {
						that.isLoading = false
						var body = res.data || {}
						if (body.code == 1 && body.data) {
							that.detail = body.data
						} else {
							that.toast(body.msg || '加载失败')
						}
					},
					fail: function() {
						that.isLoading = false
						that.toast('网络错误，请稍后重试')
					}
				})
			},
			formatTime(ts) {
				var t = this.toInt(ts)
				if (!t) return ''
				if (t > 1e12) t = Math.floor(t / 1000)
				var d = new Date(t * 1000)
				return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate()) + ' ' +
					this.pad(d.getHours()) + ':' + this.pad(d.getMinutes())
			},
			formatActivityTime(item) {
				if (!item) return ''
				if (this.toInt(item.type) === 2) return '长期活动'
				var start = this.formatTime(item.startTime)
				var end = this.formatTime(item.endTime)
				if (!start && !end) return ''
				if (!end) return start + ' 起'
				return start + ' 至 ' + end
			}
		}
	}
</script>

<style lang="scss" scoped>
	.activity-detail-page {
		min-height: 100vh;
		background: #f5f6fa;
		box-sizing: border-box;
	}

	.detail-scroll {
		height: calc(100vh - var(--status-bar-height) - 44px);
		box-sizing: border-box;
	}

	.detail-body {
		max-width: 720px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.detail-cover {
		width: 100%;
		height: 440rpx;
		display: block;
		background: #eceff3;
	}

	.meta-card {
		background: #fff;
		padding: 28rpx 32rpx;
		box-sizing: border-box;
	}

	.status-chip {
		display: inline-flex;
		align-items: center;
		gap: 10rpx;
		padding: 8rpx 18rpx;
		border-radius: 16rpx;
		background: #f0f0f0;
		margin-bottom: 18rpx;

		.status-dot {
			width: 12rpx;
			height: 12rpx;
			border-radius: 50%;
			background: #9e9e9e;
		}

		text {
			font-size: 22rpx;
			font-weight: 700;
			color: #9e9e9e;
		}

		&.on {
			background: #e8f5e9;

			.status-dot {
				background: #4caf50;
			}

			text {
				color: #4caf50;
			}
		}
	}

	.detail-title {
		display: block;
		font-size: 44rpx;
		font-weight: 800;
		color: #1b2430;
		line-height: 1.4;
		word-break: break-word;
	}

	.detail-time-row {
		margin-top: 18rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.time-ico {
		font-size: 28rpx;
		color: #93a3b4;
	}

	.detail-time {
		flex: 1;
		font-size: 26rpx;
		color: #6b7a8c;
		word-break: break-all;
	}

	.gap {
		height: 16rpx;
		background: #f5f6fa;
	}

	.content-card {
		background: #fff;
		padding: 32rpx;
		box-sizing: border-box;
		min-height: 240rpx;
	}

	.no-content {
		font-size: 28rpx;
		color: #b0b8c4;
	}

	.detail-skeleton {
		padding: 0 0 24rpx;
	}

	.sk-cover {
		height: 440rpx;
		background: linear-gradient(90deg, #eef1f6 25%, #f7f9fc 50%, #eef1f6 75%);
		background-size: 400% 100%;
		animation: sk 1.4s ease infinite;
	}

	.sk-line {
		height: 36rpx;
		margin: 24rpx 32rpx 0;
		border-radius: 12rpx;
		background: linear-gradient(90deg, #eef1f6 25%, #f7f9fc 50%, #eef1f6 75%);
		background-size: 400% 100%;
		animation: sk 1.4s ease infinite;
	}

	.sk-line.w60 {
		width: 60%;
	}

	.sk-line.w40 {
		width: 40%;
	}

	.sk-block {
		height: 280rpx;
		margin: 28rpx 32rpx 0;
		border-radius: 24rpx;
		background: linear-gradient(90deg, #eef1f6 25%, #f7f9fc 50%, #eef1f6 75%);
		background-size: 400% 100%;
		animation: sk 1.4s ease infinite;
	}

	@keyframes sk {
		0% {
			background-position: 100% 0;
		}

		100% {
			background-position: 0 0;
		}
	}

	.empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 160rpx 40rpx;
	}

	.empty-icon {
		font-size: 96rpx;
		color: rgba(147, 163, 180, 0.45);
		margin-bottom: 24rpx;
	}

	.empty-text {
		font-size: 30rpx;
		color: #6b7a8c;
		font-weight: 600;
	}

	.empty-btn {
		margin-top: 32rpx;
		padding: 16rpx 44rpx;
		border-radius: 40rpx;
		background: #4caf50;

		text {
			color: #fff;
			font-size: 26rpx;
			font-weight: 700;
		}
	}

	.page-pad {
		height: 48rpx;
	}

	@media screen and (max-width: 360px) {
		.detail-title {
			font-size: 38rpx;
		}

		.meta-card,
		.content-card {
			padding-left: 24rpx;
			padding-right: 24rpx;
		}
	}

	@media screen and (min-width: 768px) {
		.detail-body {
			max-width: 720px;
		}
	}
</style>
