<template>
	<view class="activity-page">
		<view class="header" :style="[{ height: CustomBar + 'px' }]">
			<view class="cu-bar bg-white" :style="{ height: CustomBar + 'px', paddingTop: StatusBar + 'px' }">
				<view class="action" @tap="back">
					<text class="cuIcon-back"></text>
				</view>
				<view class="content text-bold" :style="[{ top: StatusBar + 'px' }]">发现活动</view>
				<view class="action"></view>
			</view>
		</view>
		<view :style="[{ padding: NavBar + 'px 0 0 0' }]"></view>

		<scroll-view scroll-y class="activity-scroll" :refresher-enabled="true" :refresher-triggering="isRefreshing"
			@refresherrefresh="onRefresh" @scrolltolower="loadMore">
			<view class="activity-body">
				<view v-if="isLoading && !list.length" class="activity-skeleton">
					<view v-for="i in 3" :key="i" class="sk-card"></view>
				</view>

				<view v-else-if="hasError && !list.length" class="empty-box">
					<text class="cuIcon-warn empty-icon"></text>
					<text class="empty-text">活动加载失败</text>
					<text class="empty-sub">下拉刷新或点击重试</text>
					<view class="empty-btn" @tap="reload"><text>重新加载</text></view>
				</view>

				<view v-else-if="!list.length" class="empty-box">
					<text class="cuIcon-present empty-icon"></text>
					<text class="empty-text">暂无活动</text>
					<text class="empty-sub">稍后再来看看最新活动</text>
				</view>

				<block v-else>
					<view v-for="(item, index) in list" :key="item.id || index" class="act-card" @tap="onTap(item)">
						<view class="act-cover-box">
							<image v-if="item.cover" class="act-cover" :src="item.cover" mode="aspectFill"></image>
							<view v-else class="act-cover empty-cover">
								<text class="cuIcon-picfill"></text>
							</view>
							<view class="status-chip" :class="item.status == 1 ? 'on' : 'off'">
								<view class="status-dot"></view>
								<text>{{ item.status == 1 ? '进行中' : '已结束' }}</text>
							</view>
						</view>
						<view class="act-info">
							<text class="act-title">{{ item.title }}</text>
							<text v-if="stripHtml(item.content)" class="act-desc">{{ stripHtml(item.content) }}</text>
							<view class="act-meta">
								<text class="cuIcon-time act-time-ico"></text>
								<text class="act-time">{{ formatActivityTime(item) }}</text>
								<view class="type-chip" :class="item.type == 1 ? 'lim' : 'long'">
									<text>{{ item.type == 1 ? '限时' : '长期' }}</text>
								</view>
							</view>
						</view>
					</view>
					<view v-if="isLoadingMore" class="load-more"><text>加载中…</text></view>
					<view v-else-if="!hasMore" class="load-more"><text>没有更多了</text></view>
				</block>
				<view class="page-pad"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		localStorage
	} from '../../js_sdk/mp-storage/mp-storage/index.js'

	export default {
		name: 'activityCenter',
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				NavBar: this.StatusBar + this.CustomBar,
				token: '',
				list: [],
				page: 1,
				limit: 15,
				total: 0,
				isLoading: false,
				isRefreshing: false,
				isLoadingMore: false,
				hasMore: true,
				hasError: false,
				loadingFuture: null
			}
		},
		onLoad() {
			this.token = localStorage.getItem('token') || ''
			this.markReadAndLoad()
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
			request(opts) {
				var that = this
				return new Promise(function(resolve, reject) {
					that.$Net.request({
						url: opts.url,
						data: opts.data || {},
						header: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						method: opts.method || 'post',
						dataType: 'json',
						success: function(res) {
							resolve(res.data || {})
						},
						fail: function() {
							reject(new Error('network'))
						}
					})
				})
			},
			markReadAndLoad() {
				if (this.token) {
					this.request({
						url: this.$API.readActivity(),
						data: {
							token: this.token
						},
						method: 'post'
					}).catch(function() {})
				}
				this.load(true)
			},
			reload() {
				this.load(true)
			},
			onRefresh() {
				var that = this
				that.isRefreshing = true
				that.load(true).then(function() {
					that.isRefreshing = false
				}).catch(function() {
					that.isRefreshing = false
				})
			},
			load(reset) {
				var that = this
				if (that.loadingFuture) return that.loadingFuture
				if (reset) {
					that.page = 1
					that.hasMore = true
					that.hasError = false
				}
				that.isLoading = !reset || !that.list.length
				if (reset && that.list.length) that.isLoading = false
				var run = that.request({
					url: that.$API.activityList(),
					data: {
						token: that.token,
						page: that.page,
						limit: that.limit,
						searchKey: ''
					},
					method: 'post'
				}).then(function(res) {
					that.isLoading = false
					that.loadingFuture = null
					if (res.code == 1) {
						var list = Array.isArray(res.data) ? res.data : []
						if (reset) {
							that.list = list
						} else {
							that.list = that.list.concat(list)
						}
						that.total = that.toInt(res.total)
						that.page = that.page + 1
						that.hasMore = that.list.length < that.total
						that.hasError = false
					} else {
						that.hasError = !that.list.length
						that.toast(res.msg || '加载失败')
					}
					return res
				}).catch(function() {
					that.isLoading = false
					that.loadingFuture = null
					that.hasError = !that.list.length
					that.toast('网络错误，请稍后重试')
					throw new Error('network')
				})
				that.loadingFuture = run
				return run
			},
			loadMore() {
				if (this.isLoading || this.isLoadingMore || !this.hasMore) return
				this.isLoadingMore = true
				var that = this
				this.request({
					url: that.$API.activityList(),
					data: {
						token: that.token,
						page: that.page,
						limit: that.limit,
						searchKey: ''
					},
					method: 'post'
				}).then(function(res) {
					that.isLoadingMore = false
					if (res.code == 1) {
						var list = Array.isArray(res.data) ? res.data : []
						that.list = that.list.concat(list)
						that.total = that.toInt(res.total)
						that.page = that.page + 1
						that.hasMore = that.list.length < that.total
					} else {
						that.toast(res.msg || '加载更多失败')
					}
				}).catch(function() {
					that.isLoadingMore = false
					that.toast('网络错误，请稍后重试')
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
			},
			stripHtml(html) {
				if (!html) return ''
				return String(html)
					.replace(/<[^>]*>/g, '')
					.replace(/&nbsp;/g, ' ')
					.replace(/&amp;/g, '&')
					.replace(/&lt;/g, '<')
					.replace(/&gt;/g, '>')
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'")
					.replace(/\s+/g, ' ')
					.trim()
			},
			onTap(item) {
				if (!item) return
				var linkType = this.toInt(item.linkType) || 1
				var linkUrl = (item.linkUrl || '').trim()
				if (linkType === 2 && linkUrl) {
					// #ifdef H5
					window.open(linkUrl, '_blank')
					// #endif
					// #ifndef H5
					plus.runtime.openURL(linkUrl)
					// #endif
					return
				}
				if (item.id) {
					uni.navigateTo({
						url: '/pages/activity/detail?id=' + item.id
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.activity-page {
		min-height: 100vh;
		background: #f5f6fa;
		box-sizing: border-box;
	}

	.activity-scroll {
		height: calc(100vh - var(--status-bar-height) - 44px);
		box-sizing: border-box;
	}

	.activity-body {
		padding: 12rpx 24rpx 40rpx;
		max-width: 720px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.act-card {
		background: #fff;
		border-radius: 32rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		border: 1rpx solid #eef1f6;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
		box-sizing: border-box;
	}

	.act-cover-box {
		position: relative;
		width: 100%;
		height: 280rpx;
		background: #eceff3;
	}

	.act-cover {
		width: 100%;
		height: 100%;
		display: block;
	}

	.empty-cover {
		display: flex;
		align-items: center;
		justify-content: center;

		text {
			font-size: 64rpx;
			color: #b0b8c4;
		}
	}

	.status-chip {
		position: absolute;
		top: 20rpx;
		left: 20rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 8rpx 20rpx;
		border-radius: 24rpx;
		background: rgba(255, 255, 255, 0.94);
		backdrop-filter: blur(8rpx);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

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
			.status-dot {
				background: #4caf50;
			}

			text {
				color: #4caf50;
			}
		}
	}

	.act-info {
		padding: 22rpx 24rpx 24rpx;
	}

	.act-title {
		display: block;
		font-size: 32rpx;
		font-weight: 700;
		color: #1b2430;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.act-desc {
		display: block;
		margin-top: 10rpx;
		font-size: 26rpx;
		color: #6b7a8c;
		line-height: 1.5;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.act-meta {
		margin-top: 16rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.act-time-ico {
		font-size: 26rpx;
		color: #93a3b4;
	}

	.act-time {
		flex: 1;
		min-width: 0;
		font-size: 22rpx;
		color: #93a3b4;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.type-chip {
		flex-shrink: 0;
		padding: 4rpx 14rpx;
		border-radius: 14rpx;
		background: #fff3e0;

		text {
			font-size: 20rpx;
			font-weight: 700;
			color: #ff9800;
		}

		&.long {
			background: #e3f2fd;

			text {
				color: #2196f3;
			}
		}
	}

	.activity-skeleton {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		padding-top: 8rpx;
	}

	.sk-card {
		height: 360rpx;
		border-radius: 32rpx;
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

	.empty-sub {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: rgba(107, 122, 140, 0.75);
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

	.load-more {
		text-align: center;
		padding: 28rpx;

		text {
			font-size: 24rpx;
			color: #93a3b4;
		}
	}

	.page-pad {
		height: 40rpx;
	}

	@media screen and (max-width: 360px) {
		.activity-body {
			padding-left: 16rpx;
			padding-right: 16rpx;
		}

		.act-title {
			font-size: 30rpx;
		}

		.act-cover-box {
			height: 240rpx;
		}
	}

	@media screen and (min-width: 768px) {
		.activity-body {
			max-width: 720px;
		}

		.activity-scroll {
			height: calc(100vh - var(--status-bar-height) - 44px);
		}
	}

	@media screen and (min-width: 1024px) {
		.activity-body {
			max-width: 720px;
		}
	}
</style>
