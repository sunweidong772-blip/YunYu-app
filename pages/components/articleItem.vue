<template>
	<view class="dynamic">
		<!--帖子推流广告区域 margin-left-sm margin-right-sm-->
		<view class="cu-card article no-card" v-if="item.isAds" @tap="goAds(item)">
			<view class="cu-item shadow">
				<view class="title">
					<view class="text-cut">{{item.name}}</view>
				</view>
				<view class="content article-content" style="position: relative;">
					<image :src="item.img" mode="aspectFill"></image>
					<view class="desc">
						<view class="text-content">{{item.intro}}{{item.img}}</view>
						<view class="ads-more" @tap="goAds(item)">了解更多<text class="cuIcon-right"></text></view>
					</view>
					<text class="ads-ico">广告</text>
				</view>
			</view>
		</view>
		<!--帖子推流广告区域end-->
		<view class=" cu-card article no-card" v-else>
			<!-- <view  class="cu-item"> -->
			<!-- <view class="cu-card dynamic no-card"> -->
			<view class="cu-list menu-avatar square-list">
				<view class="cu-item">
					<view class="cu-avatar round lg" :style="'background-image:url('+item.authorInfo.avatar+');'"
						@tap="toUser(item)">
						<!--  #ifdef H5 || APP-PLUS -->

						<!--  #endif -->
					</view>
					<view class="content flex-sub">
						<block v-if="item.authorInfo.uid!=0">
							<!--  #ifdef H5 || APP-PLUS -->
							<block v-if="item.authorInfo.isvip > 0">
								<text v-if="item.authorInfo.isvip==1" class="content-author-name tn-text-bold"
									style="color: #f2ad5c;" @tap="toUser(item)">{{item.authorInfo.name}}</text>
								<text v-if="item.authorInfo.isvip==2" class="content-author-name text-bold"
									style="color: #e6216d;" @tap="toUser(item)">{{item.authorInfo.name}}</text>
								<!-- <text class="userlv" v-if="item.authorInfo.isvip==1"
										style="background: linear-gradient(to bottom right, #f2ad5c, #e6216d,#901ccb);color:white;padding: 3px 5px;border-radius: 10px;">
										VIP
									</text> -->
							</block>
							<block v-else>
								<text class="content-author-name " :style="{color:item.authorInfo.screenNamecolor}"
									@tap="toUser(item)">{{item.authorInfo.name}}</text>
							</block>
							<text class="userlv"
								:style="getLvStyle(item.authorInfo.experience)">{{getLv(item.authorInfo.experience)}}
							</text>
							<text class="group customize adm" v-if="item.authorInfo.group=='administrator'">管理员
							</text>
							<text class="group customize" v-if="item.authorInfo.group=='editor'">编辑
							</text>
							<text class="group" :style="{backgroundColor:item.authorInfo.customizecolor}"
								v-if="item.authorInfo.customize&&item.authorInfo.customize!=''">
								{{item.authorInfo.customize}}
							</text>
							<!--  #endif -->
						</block>
						<view class="text-gray text-sm flex">
							{{formatDate(item.created)}}
						</view>
					</view>
					<view class="action space-follow">
						<!-- <view class="cuIcon-more" @tap="showMM(index)"></view> -->
						
					</view>
				
				</view>
			</view>

			<!-- </view> -->

			<!-- <view class="cu-list cu-card article no-card"> -->
			<view class="cu-item">
				<view class="title" @tap="toInfo(item)">
					<view class="text-cut">
						<view class="data-time" style="color: #888;font-size: 9px;font-weight: normal !important;">
							<!-- 回复于{{formatDate(item.replyTime)}} -->
						</view>
						<block>
							<text class="tz-tag margin-right-xs" style="backgroundColor:#ff0000"
								v-if="item.rewardAmount > 0 ">+{{item.rewardAmount}}</text>
							<text class="tz-tag margin-right-xs" style="backgroundColor:#e51212"
								v-if="item.commentsNum >= 200">热</text>
							<text class="tz-tag margin-right-xs" style="backgroundColor:#9da7aa"
								v-if="item.tzlock == 1">锁</text>
							<text style="color: #444;">{{replaceSpecialChar(item.title)}}</text>
						</block>
					</view>
				</view>
				<block v-if="item.images.length == 0">
					<view class="content article-content cu-card article no-card">
						<view class="text-content" v-if="item.text.length > 0"> {{subText(item.text,80)}}</view>
					</view>
				</block>
				<block v-if="item.images.length > 0">
					<view class="content article-content cu-card article no-card">
						<view class="text-content text-ellipsis" v-if="item.text.length > 0" @tap="toInfo(item)">
							{{subText(item.text,80)}}
						</view>

						<view class="grid flex-sub col-3 grid-square" @tap="previewImage(item.images)">
							<!-- 1图 -->
							<block v-if="item.images.length == 1">
								<!-- <view class="grid flex-sub col-1 grid-square"> -->
								<view class="bg-img">
									<!-- <image :src="item.images[0]" mode="scaleToFill"> </image> -->
									<tn-lazy-load :image="item.images[0]" :threshold="-150" :height="400"
										imgMode="aspectFill"></tn-lazy-load>

								</view>
								<!-- </view> -->
							</block>
							<!-- 2图 -->
							<block v-if="item.images.length == 2">
								<!-- <view class="grid flex-sub col-2 grid-square"> -->
								<view class="bg-img">
									<!-- <image :src="item.images[0]" mode="aspectFill"></image> -->
									<tn-lazy-load :image="item.images[0]" :threshold="-150" :height="400"
										imgMode="aspectFill"></tn-lazy-load>
								</view>
								<view class="bg-img" v-if="item.images.length > 1">
									<!-- <image :src="item.images[1]" mode="aspectFill"></image> -->
									<tn-lazy-load :image="item.images[1]" :threshold="-150" :height="400"
										imgMode="aspectFill"></tn-lazy-load>
								</view>
								<!-- </view> -->
							</block>
							<!-- 3图 -->
							<block v-if="item.images.length >= 3">
								<view class="bg-img">
									<!-- <image :src="item.images[0]" mode="aspectFill"> </image> -->
									<tn-lazy-load :image="item.images[0]" :threshold="-150" :height="400"
										imgMode="aspectFill"></tn-lazy-load>
								</view>
								<view class="bg-img">
									<!-- <image :src="item.images[1]" mode="aspectFill"></image> -->
									<tn-lazy-load :image="item.images[1]" :threshold="-150" :height="400"
										imgMode="aspectFill"></tn-lazy-load>
								</view>
								<view class="bg-img">
									<!-- <image :src="item.images[2]" mode="aspectFill"></image> -->
									<tn-lazy-load :image="item.images[2]" :threshold="-150" :height="400"
										imgMode="aspectFill"></tn-lazy-load>

									<text v-if="item.images.length > 3" class="extra-count">
										<text class="cuIcon-add center-add">
											{{ item.images.length-3 }}</text>
									</text>
								</view>
							</block>
						</view>

					</view>
				</block>
				<view class="article-content-btn article-list-btn flex justify-between " style="margin-top:30upx;">
					<view class="tn-padding-xs text-shojo"
						style="border-radius: 40upx;color: #262626;font-weight: bold;background: #f1f1f1;margin-top:3upx;">
						<text class="padding-sm radius" v-if="item.category.length>0">{{item.category[0].name}}</text>
					</view>
					<view class="flex align-center" style="color:#666">
						<view class="margin-left-sm" style="width: 48upx;height: 39upx;">
							<image src="../../static/page/lll.png" mode="widthFix"></image>
						</view>
						<text style="margin-right: 20px;"> {{formatNumber(item.views)}} </text>

						<view class="margin-left-sm" style="width: 40upx;height: 44upx;">
							<image src="../../static/page/like_unpressed.png" mode="widthFix"></image>
						</view>
						<text style="margin-right: 20px;"> {{item.likes}} </text>

						<view class="margin-left-sm" style="width: 40upx;height: 42upx;">
							<image src="../../static/page/icon_message_pink.png" mode="widthFix"></image>
						</view>
						<text v-if="item.commentsNum>0">{{item.commentsNum}}</text>
						<text v-else> {{item.commentsNum}} </text>
					</view>
				</view>
			</view>
			<!-- </view> -->
			<view class="padding-xs" style="background-color: #f6f6f6;"></view>
			<!-- </view> -->
		</view>
		  <!-- {{item}} -->
		<!-- 菜单弹出 -->
		<u-popup :show="showMoreMenu" @close="showMoreMenu = false" :closeable="true" round="10">
			<view style="padding: 30rpx;">
				<view style="
							text-align: center;
							color: #999;">
					<text>分享至</text>
				</view>
				<view style="margin-top: 50rpx;">
					<u-row customStyle="border-bottom:1rpx solid #88d8c00a;padding-bottom:30rpx"
						justify="space-around">
						<block v-for="(item,index) in share" :key="index">
							<u-row align="center" customStyle="flex-direction:column"
								@click="shareArticle('api',item)">
								<view style="padding: 20rpx;border-radius: 100rpx;"
									:style="{background:item.color}">
									<u-icon :name="item.icon" color="white" size="24"></u-icon>
								</view>
								<text style="margin-top: 20rpx;">{{item.name}}</text>
							</u-row>
						</block>
					</u-row>
					<view style="display: flex;flex-direction: column;margin-top: 50rpx;">
						<u-row style="margin:20rpx 0">
							<i class="ess mgc_alert_line" style="font-size: 40rpx;"></i>
							<text style="margin-left:20rpx">举报</text>
						</u-row>
						<u-row style="margin:20rpx 0" @click="shareArticle('link')">
							<i class="ess mgc_flash_line" style="font-size: 40rpx;"></i>
							<text style="margin-left:20rpx">复制链接</text>
						</u-row>
						<!-- #ifdef APP -->
						<u-row style="margin:20rpx 0" @click="shareArticle('system')">
							<i class="ess mgc_share_forward_line" style="font-size: 40rpx;"></i>
							<text style="margin-left:20rpx">通过系统分享</text>
						</u-row>
						<!-- #endif -->
						<u-row style="margin:20rpx 0" @click="goEdit()" v-if="permission">
							<i class="ess mgc_edit_line" style="font-size: 40rpx;"></i>
							<text style="margin-left:20rpx">编辑</text>
						</u-row>
						<u-row style="margin:20rpx 0;color:red" @click="showDelete = true"
							v-if="permission">
							<i class="ess mgc_delete_2_line" style="font-size: 40rpx;"></i>
							<text style="margin-left:20rpx">删除</text>
						</u-row>
					</view>
				</view>
			</view>
			<!-- 删除弹出 -->
			<u-popup :show="showDelete" :round="10" mode="center" @close="showDelete = false"
				customStyle="width:500rpx">
				<view style="display: flex;
								flex-direction: column;
								align-items: center;
								justify-content: center;
								padding: 50rpx;">
					<text style="font-size: 34rpx;">提示</text>
					<view style="margin-top:30rpx">
						<text>是否确定删除？</text>
					</view>
					<u-row customStyle="margin-top: 60rpx;flex:1;width:100%" justify="space-between">
						<u-button plain color="#88d8c0" customStyle="height:60rpx;margin-right:10rpx"
							shape="circle" @click="showDelete = false">取消</u-button>
						<u-button color="#88d8c0" customStyle="height:60rpx;margin-left:10rpx"
							shape="circle" @click="deleteArticle()">确定</u-button>
					</u-row>
				</view>
			</u-popup>
		</u-popup>
	</view>

</template>

<script>
	export default {
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
			isHead: {
				type: Boolean,
				default: false
			},
			permission: {
				type: Boolean, // Assuming it's a boolean, adjust if needed
				default: false // Provide a default value
			}
		},
		name: "articleItem",
		data() {
			return {
				group: "",
				isVipContent: "",
				share: [{
						name: '微信',
						icon: 'weixin-fill',
						provider: 'weixin',
						type: 0,
						scene: 'WXSceneSession',
						color: '#46d262'
					},
					{
						name: '朋友圈',
						icon: 'moments',
						provider: 'weixin',
						type: 0,
						scene: 'WXSceneTimeline',
						color: '#46d262'
					},
					{
						name: 'QQ',
						icon: 'qq-fill',
						provider: 'qq',
						type: 2,
						scene: '',
						color: '#0070ff'
					},

				],
				showDelete: false,
				showMoreMenu: false,
			};
		},
		methods: {
			showMM(type,index){
				this.showMoreMenu=true;
				console.log('8888')
			},
			previewImage(imageList, image) {
				//预览图片
				uni.previewImage({
					urls: imageList,
					current: image
				});
			},
			subText(text, num) {
				if (text.length < null) {
					return text.substring(0, num) + "……"
				} else {
					return text;
				}

			},
			replaceSpecialChar(text) {
				text = text.replace(/&quot;/g, '"');
				text = text.replace(/&amp;/g, '&');
				text = text.replace(/&lt;/g, '<');
				text = text.replace(/&gt;/g, '>');
				text = text.replace(/&nbsp;/g, ' ');
				return text;
			},
			// formatDate(datetime) {
			// 	var datetime = new Date(parseInt(datetime * 1000));
			// 	var year = datetime.getFullYear(),
			// 		month = ("0" + (datetime.getMonth() + 1)).slice(-2),
			// 		date = ("0" + datetime.getDate()).slice(-2),
			// 		hour = ("0" + datetime.getHours()).slice(-2),
			// 		minute = ("0" + datetime.getMinutes()).slice(-2);
			// 	var result = year + "-" + month + "-" + date + " " + hour + ":" + minute;
			// 	return result;
			// },
			formatDate(datetime) {
				const timeUnits = [{
						unit: 'year',
						divisor: 31536000000,
						suffix: '年前'
					},
					{
						unit: 'month',
						divisor: 2592000000,
						suffix: '个月前'
					},
					{
						unit: 'week',
						divisor: 604800000,
						suffix: '周前'
					},
					{
						unit: 'day',
						divisor: 86400000,
						suffix: '天前'
					},
					{
						unit: 'hour',
						divisor: 3600000,
						suffix: '小时前'
					},
					{
						unit: 'minute',
						divisor: 60000,
						suffix: '分钟前'
					},
					{
						unit: 'second',
						divisor: 1000,
						suffix: '秒前'
					}
				]
				const diff = new Date() - new Date(datetime * 1000)
				for (const {
						divisor,
						suffix
					}
					of timeUnits) {
					const value = Math.floor(diff / divisor)
					if (value >= 1) return `${value}${suffix}`
				}
				return '刚刚'
			},
			formatNumber(num) {
				return num >= 1e3 && num < 1e4 ? (num / 1e3).toFixed(1) + 'k' : num >= 1e4 ? (num / 1e4).toFixed(1) + 'w' :
					num
			},
			toInfo(data) {
				var that = this;

				uni.navigateTo({
					url: '/pages/contents/info?cid=' + data.cid + "&title=" + data.title
				});
			},
			toUser(data) {
				var that = this;
				var name = data.author;
				var title = data.author + "的信息";
				var id = data.authorId;

				var type = "user";
				uni.navigateTo({
					url: '/pages/contents/userinfo?title=' + title + "&name=" + name + "&uid=" + id + "&avatar=" +
						encodeURIComponent(data.avatar)
				});
			},
			goAds(data) {
				var that = this;
				var url = data.url;
				var type = data.urltype;
				// #ifdef APP-PLUS
				if (type == 1) {
					plus.runtime.openURL(url);
				}
				if (type == 0) {
					plus.runtime.openWeb(url);
				}
				// #endif
				// #ifdef H5
				window.open(url)
				// #endif
			},
			getLv(i) {
				var that = this;
				if (!i) {
					var i = 0;
				}
				var lv = that.$API.getLever(i);
				var leverList = that.$API.GetLeverList();
				return leverList[lv];
			},
			getLvStyle(i) {
				var that = this;
				if (!i) {
					var i = 0;
				}
				var lv = that.$API.getLever(i);
				var rankStyle = that.$API.GetRankStyle();
				var userlvStyle = "color:#fff;background-color: " + rankStyle[lv];
				return userlvStyle;
			},

		}
	}
</script>

<style scoped>
	.text-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		word-break: break-all;
	}

	.extra-count {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.47);
		color: white;
		font-size: 20px;
		border-radius: 20rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.grid.grid-square>uni-view {
		border-radius: 20rpx;
		overflow: hidden;
	}

	.text-ellipsis {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		word-break: break-all;
		line-height: 1.5;
		font-size: 28rpx;
		color: #666;
	}
</style>