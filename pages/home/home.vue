<template>
	<view :class="$store.state.AppStyle">
		<view class="header" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar bg-white" :style="{'height': CustomBar + 'px','padding-top':StatusBar + 'px'}">
				<!--  #ifdef MP -->
				<view class="action" @tap="toSearch">
					<text class="cuIcon-search"></text>
				</view>
				<view class="content text-bold" :style="[{top:StatusBar + 'px'}]">
					首页
				</view>
				<!--  #endif -->
				<!--  #ifdef H5 || APP-PLUS -->
				<!-- <view class="cu-avatar round" @tap="goUserInfo()" :style="userInfo.style" v-if="token!=''"></view>
				<view class="cu-avatar round" @tap="goUserInfo()" v-else>
					<text class="home-noLogin">登录</text>
				</view> -->
				<view class="cu-bar bg-white" :style="{'height': 50 + 'px'}">
					<view @click="flag=0" :class="flag==0?'tab-wrap-index square-box':'square-box2'"
						style="margin: 0upx 30upx 0upx 30upx;">首页</view>
					<view @click="flag=1" :class="flag==1?'tab-wrap-index square-box':'square-box2'"
						style="margin: 0px 100upx 0px 20upx;">发现</view>

					<view class="search-form radius" style="border-radius: 50%;" @tap="toSearch()">
						<text class="cuIcon-search"></text>
						<input type="text" :placeholder="sousuok" confirm-type="search"></input>
					</view>
					<view class="action header-btn ">
						<text class="cuIcon-notice" @tap="toLink('/pages/home/find')">
							<text class="noticeSum bg-red" v-if="noticeSum>0">{{noticeSum}}</text>
						</text>

						<!-- <text class="cuIcon-scan" @tap="toScan"></text> -->

					</view>

				</view>

				<!--  #endif -->
			</view>

		</view>

		<block v-if="flag==0">
			<view class="home-nav metaList" :style="'top:'+CustomBar+'px'">
				<block v-if="metaList.length>0">
					<scroll-view scroll-x class="bg-white nav" scroll-with-animation :scroll-left="scrollLeft">
						<view class="cu-item" :class="item.mid==TabCur?'text-blue cur':''"
							v-for="(item,index) in metaList" :key="index" @tap="tabSelect" :data-id="item.mid"
							v-if="item.parent==0">
							{{item.name}}
						</view>
					</scroll-view>
				</block>
				<view class="goCategory" @tap="goCategory">
					<text class="cuIcon-more"></text>
				</view>
			</view>
			<view :style="[{padding:NavBar+45 + 'px 10px 0px 10px'}]"></view>
			<!-- <view class=""> -->
				<block v-if="TabCur==0">
					<!-- 轮播 begin -->
					<swiper v-if="lunbo_of==1" class="screen-swiper" :class="dotStyle?'square-dot':'round-dot'"
						style="border-radius: 10upx;" :indicator-dots="true" :circular="true" :autoplay="true"
						interval="4000" duration="500">
						<swiper-item v-for="(item,index) in swiperList1" :key="index" v-if="index<homeadimage_sl"
							@click="swiperclick1(index)">
							<view class="swiper-box" style="border-radius: 20upx; ">
								<image :src="item.url" mode="aspectFill"></image>
								<video :src="item.url" autoplay loop muted :show-play-btn="false" :controls="false"
									objectFit="cover" v-if="item.type=='video'"></video>
							</view>
						</swiper-item>
					</swiper>

					<!-- 轮播 end -->
					<!-- 推荐功能（后台 typechoHome/featureList，仿 Flutter）begin -->
					<view class="home-feature-block" v-if="featureList.length>0">
						<view class="home-feature-header">
							<text class="cuIcon-apps home-feature-header-icon"></text>
							<text class="home-feature-header-title">推荐功能</text>
							<view class="home-feature-header-more">
								<text>右滑查看</text>
								<text class="cuIcon-right"></text>
							</view>
						</view>
						<scroll-view scroll-x class="home-feature-scroll" :show-scrollbar="false">
							<view class="home-feature-row">
								<view class="home-feature-item" v-for="(item,index) in featureList" :key="item.id || index"
									@tap="onFeatureTap(item)">
									<view class="home-feature-icon"
										:style="{ backgroundColor: featureIconColor(index) }">
										<image v-if="item.icon" :src="item.icon" mode="aspectFill"></image>
										<text v-else>{{ featureTextIcon(item.name) }}</text>
									</view>
									<text class="home-feature-name">{{ item.name }}</text>
								</view>
							</view>
						</scroll-view>
					</view>
					<!-- 推荐功能 end -->
					<view v-if="top_of==1" class="index-sort grid col-4" style="border-radius: 0upx; ">
						
						<view class="index-sort-box">
							<waves itemClass="butclass">
								<view class="index-sort-main" @tap="goPage('/pages/contents/blackhouse')">
									<view class="index-sort-i"
										style="border-radius: 20upx;background: linear-gradient(to bottom right, #008600, #333333);box-shadow: #55ff0059 0px 3px 5px 0px;">
										<text class="cuIcon-apps" style="color:  #ffffff;"></text>
									</view>
									<view class="index-sort-text">
										小黑屋
									</view>
								</view>
							</waves>
						</view>
						<view class="index-sort-box">
							<waves itemClass="butclass">
								<view class="index-sort-main" @tap="goPage('/pages/shop/shop')">
									<view class="index-sort-i"
										style="border-radius: 20upx;background: linear-gradient(to bottom right, #aaffff, #89adff);box-shadow: #00aaff59 0px 3px 5px 0px;">
										<text class="cuIcon-goods" style="color:  #ffffff;"></text>
									</view>
									<view class="index-sort-text">
										商城
									</view>
								</view>
							</waves>
						</view>

						<view class="index-sort-box">
							<waves itemClass="butclass">
								<view class="index-sort-main" @tap="goPage('/pages/ads/home')">
									<view class="index-sort-i"
										style="border-radius: 20upx;background: linear-gradient(to bottom right, #ffd198, #ff5c10);box-shadow: #aa55ff59 0px 3px 5px 0px;">
										<text class="cuIcon-text" style="color:  #ffffff;"></text>
									</view>
									<view class="index-sort-text">
										广告位
									</view>
								</view>
							</waves>
						</view>
						<view class="index-sort-box">
							<waves itemClass="butclass">
									<view class="index-sort-main" @tap="toCheckin">
									<view class="index-sort-i"
										style="border-radius: 20upx;background: linear-gradient(to bottom right, #5555ff, #aa55ff);box-shadow: #ffaa0059 0px 3px 5px 0px;">
										<text class="cuIcon-calendar" style="color:  #ffffff;"></text>
									</view>
									<view class="index-sort-text">
										签到
									</view>
								</view>
							</waves>
						</view>
					</view>

					<!-- 滚动通知开头 -->
					<view v-if="gonggao_of==1 && noticeText" class="home-notice-bar">
						<text class="cuIcon-notification home-notice-icon"></text>
						<marquee class="home-notice-text" scrollamount="4">{{ noticeText }}</marquee>
					</view>
					<!-- 滚动通知结束 -->
					<view class="all-box" :style="TabCur!=0?'margin-top:0;':''"
						style="background-color: rgb(0, 0, 0,0);">
						<view v-if="hometop==1">
							<block v-for="(item,index) in topContents" :key="'top'+index">
								<articleItemtop :item="item" :isTop="true"></articleItemtop>
							</block>
						</view>
					</view>

				</block>
				<block v-else>
					<view class="all-box" :style="TabCur!=0?'margin-top:0;':''"
						style="background-color: rgb(0, 0, 0,0);">
						<view v-if="hometop==1">
							<block v-for="(item,index) in topContents" :key="'top'+index">
								<articleItemtop :item="item" :isTop="true"></articleItemtop>
							</block>
						</view>
					</view>
				</block>
				<view class="ads-banner" v-if="bannerAdsInfo!=null">
					<image :src="bannerAdsInfo.img" mode="widthFix" @tap="goAds(bannerAdsInfo)"></image>
				</view>
				<!--底下改成滑动形式-->
			<!-- </view> -->
			<!-- <view class=""> -->
				<tn-sticky :offsetTop="60">
				<view class="all-box" :style="TabCur!=0? 'margin-top:0;':''">
					<view class="cu-bar bg-white" v-if="TabCur==0">
						<view class="action">
							<text class="square-box" :class="spaceDataType==0?'cur':''"
								@tap="setspaceDataType(0,true)">关注</text>
							<text class="square-box" :class="spaceDataType==1?'cur':''"
								@tap="setspaceDataType(1,true)">最新</text>
							<text class="square-box" :class="spaceDataType==2?'cur':''"
								@tap="setspaceDataType(2,true)">回复</text>
							<text class="square-box" :class="spaceDataType==3?'cur':''"
								@tap="setspaceDataType(3,true)">最热</text>
						</view>
					</view>
				</view>
				</tn-sticky>

			<!-- </view> -->
			<view class="home-feed-wrap">
				<view v-if="token==''&&spaceDataType==0">
					<view class="no-data">
						<text class="cuIcon-community"></text>
						请先登录哦！
						<view class="text-center margin-top-sm">
							<text class="cu-btn bg-shojo radius" style="border-radius: 50px;" @tap="goLogin()">登录</text>
							<text class="cu-btn bg-olive margin-left-sm" style="border-radius: 50px;"
								@tap="goRegister()">注册</text>
						</view>
					</view>
				</view>
				<view v-if="spaceDataType==0">
					<block v-for="(item,index) in followcontentsList" :key="index"
						v-if="dataLoad&&token!=''&&spaceDataType==0">
						<articleItem :item="item" :permission="group === 'administrator' || group === 'editor'"></articleItem>
					</block>
					<view v-if="dataLoad">
						<view class="load-more" @tap="loadMore" v-if="dataLoad">
							<text>{{moreText}}</text>
						</view>
					</view>
				</view>
				<view v-else>
					<block v-for="(item,index) in contentsList" :key="index" v-if="dataLoad">
						<articleItem :item="item" :permission="false"></articleItem>
					</block>
					<view class="load-more" @tap="loadMore" v-if="dataLoad">
						<text>{{moreText}}</text>
					</view>
				</view>
			</view>
		</block>
		<!-- 发现 -->
		<block v-if="flag==1" :class="AppStyle">
			<view :style="[{padding:NavBar + 10 + 'px 10px 0px 10px'}]"></view>
			<swiper class="screen-swiper swiper-container" style="border-radius: 20upx;margin: 0px 10px 10px 10px;"
				:class="dotStyle?'square-dot':'round-dot'" :indicator-dots="true" :circular="true" :autoplay="true"
				interval="5000" duration="500" v-if="bannerswitch==1">
				<swiper-item v-for="(item,index) in swiperList2" :key="index" v-if="index<adimage_sl">
					<view class="swiper-box" style="border-radius: 20upx;" @click="swiperclick(index)">
						<image style="width: 100%; height: 100%;" mode="aspectFill" :src="item.url"></image>
					</view>
				</swiper-item>
			</swiper>
			<view class="data-box">
				<view class="cu-bar bg-white">
					<view class="action data-box-title">
						<text class="cuIcon-titles text-rule"></text> 工具库
					</view>
					<view class="action more">

					</view>
				</view>
				<view class="index-sort grid col-4 tool-sort">
					<view class="index-sort-box">
						<waves itemClass="butclass">
							<view class="index-sort-main" @tap="goPage('/pages/contents/imagetoday')">
								<view class="index-sort-i" style="background-color: #039a54;">
									<text class="cuIcon-picfill"></text>
								</view>
								<view class="index-sort-text">
									图库
								</view>
							</view>
						</waves>
					</view>

					<!--  #ifdef H5 || APP-PLUS -->
					<view class="index-sort-box">
						<waves itemClass="butclass">
							<view class="index-sort-main" @tap="goPage('/pages/ads/home')">
								<view class="index-sort-i" style="background-color: #7f165e;">
									<text class="cuIcon-read"></text>
								</view>
								<view class="index-sort-text">
									广告位
								</view>
							</view>
						</waves>
					</view>
					<!--  #endif -->
					<view class="index-sort-box">
						<waves itemClass="butclass">
							<view class="index-sort-main" @tap="goPage('/pages/shop/shop')">
								<view class="index-sort-i" style="background-color: #ff3333;">
									<text class="cuIcon-taoxiaopu"></text>
								</view>
								<view class="index-sort-text">
									积分商城
								</view>
							</view>
						</waves>
					</view>
					<!--  #ifdef MP -->
					<view class="index-sort-box">
						<waves itemClass="butclass">
							<view class="index-sort-main" @tap="goPage('/pages/contents/randlist')">
								<view class="index-sort-i">
									<text class="cuIcon-refresh"></text>
								</view>
								<view class="index-sort-text">
									随机阅读
								</view>
							</view>
						</waves>
					</view>
					<!--  #endif -->
					<view class="index-sort-box">
						<waves itemClass="butclass">
							<view class="index-sort-main" @tap="goPage('/pages/home/tool')">
								<view class="index-sort-i" style="background-color: #7d7c7c;">
									<text class="cuIcon-similar"></text>
								</view>
								<view class="index-sort-text">
									更多
								</view>
							</view>
						</waves>
					</view>
				</view>
			</view>
			<view class="ads-banner" v-if="bannerAdsInfo!=null">
				<image :src="bannerAdsInfo.img" mode="widthFix" @tap="goAds(bannerAdsInfo)"></image>
			</view>
			<!-- 滚动通知开头 -->
			<view v-if="noticeText" class="home-notice-bar">
				<text class="cuIcon-notification home-notice-icon"></text>
				<marquee class="home-notice-text" scrollamount="4">{{ noticeText }}</marquee>
			</view>
			<!-- 滚动通知结束 -->
			<view class="data-box">
				<view class="cu-bar bg-white">
					<view class="action data-box-title">
						<text class="cuIcon-titles text-rule"></text> 热销商品
					</view>
					<view class="action more" @tap="goPage('/pages/shop/shop')">
						<text>进入商城</text><text class="cuIcon-right"></text>
					</view>
				</view>
				<view class="shop-list" style="padding: 10upx;">
					<block v-for="(item,index) in shopList" :key="index">
						<shopItem :item="item"></shopItem>
					</block>
				</view>
			</view>
			<view class="data-box" style="border-radius: 20upx;margin-top:10px">
				<view class="cu-bar bg-white" style="border-radius: 10px;padding: 15px 5px 0px 5px;">
					<view class="action data-box-title">
						<text class="cuIcon-titles text-rule"></text>推荐帖子
					</view>
					<view class="action more" @tap='toRecommend("更多推荐","commentsNum")'>
						<text>更多推荐</text><text class="cuIcon-right"></text>
					</view>
				</view>
				<view class="top">
					<view class="top-box" v-for="(item,index) in recommendList" :key="index" @tap="toInfo(item)">
						<text>{{index+1}}</text>{{item.title}}
					</view>
				</view>
			</view>
			<view class="all-box" :style="TabCur!=0?'margin-top:0;':''" style="background-color: rgb(0, 0, 0,0);">
				<view v-if="findtop==1">
					<block v-for="(item,index) in topContents" :key="'top'+index">
						<articleItemtop :item="item" :isTop="true"></articleItemtop>
					</block>
				</view>
			</view>
			<view class="data-box" v-if="act_of==1">
				<view class="cu-bar bg-white">
					<view class="action data-box-title">
						<text class="cuIcon-titles text-rule"></text> 最近活跃用户
					</view>
				</view>
				<view class="cu-list menu-avatar userList" style="padding-bottom: 20upx;">
					<view class="cu-item" v-for="(item,index) in userList" :key="index" @tap="toUserContents(item)">
						<view class="cu-avatar round lg" :style="item.style"></view>
						<view class="content">
							<view class="text-grey">
								<block v-if="item.screenName">{{item.screenName}}</block>
								<block v-else>{{item.name}}</block>
								<text v-if="item.groupKey=='contributor'||item.groupKey=='administrator'"
									class="cuIcon-lightfill"></text>
								<!--  #ifdef H5 || APP-PLUS -->
								<block v-if="item.isvip>0">
									<block v-if="item.vip==1">
										<text class="isVIP bg-gradual-red">VIP</text>
									</block>
									<block v-else>
										<text class="isVIP bg-yellow">VIP</text>
									</block>
								</block>
								<!--  #endif -->
							</view>
							<view class="text-gray text-sm flex">
								<view class="text-cut">
									上次活跃:
									<text class="text-blue" v-if="item.posttime>0">{{formatDate(item.posttime)}}</text>
									<text class="text-blue" v-else>暂未活跃</text>
								</view>
							</view>
						</view>
						<view class="action goUserIndex">
							<view class="cu-btn text-blue">主页</view>
						</view>
					</view>
				</view>
			</view>
			<view class="data-box">
				<view class="cu-bar bg-white">
					<view class="action data-box-title">
						<text class="cuIcon-titles text-rule"></text> 标签云
					</view>
					<view class="action more" @tap="toAlltag">
						<text>更多标签</text><text class="cuIcon-right"></text>
					</view>
				</view>
				<view class="tags">
					<text class="tags-box" v-for="(item,index) in tagList"
						@tap='toCategoryContents("#"+item.name+"#",item.mid)'>
						# {{item.name}}
					</text>

				</view>
			</view>

		</block>

		<!--加载遮罩-->
		<view class="loading" v-if="isLoading==0">
			<view class="loading-main">
				<image src="../../static/loading.gif"></image>
			</view>
		</view>
		<!--加载遮罩结束-->

		<view class="full-noLogin" v-if="noLogin">
			<view class="full-noLogin-main">
				<view class="full-noLogin-text">
					您需要登录后才可以查看内容哦！
				</view>
				<view class="full-noLogin-btn">
					<view class="cu-btn bg-blue" @tap="goLogin()">
						立即登录
					</view>
				</view>
			</view>
		</view>
		<!-- <view style="width: 100%; height: 100upx;"></view> -->
		<!--弹窗公告-->
		<view class="announcement" v-if="isAnnouncement&&Update!=1&&Updateb!=1">
			<view class="announcement-bg" @tap="isAnnouncement=false">

			</view>
			<view class="announcement-main">
				<view class="announcement-title">
					网站公告
					<text class="cuIcon-close text-red" @tap="isAnnouncement=false"></text>
				</view>
				<view class="announcement-concent">
					<rich-text :nodes="announcement"></rich-text>
				</view>
				<view class="announcement-btn">
					<button class="cu-btn bg-gradual-blue lg" @tap="readAnnouncement">我知道了</button>
				</view>
			</view>
		</view>
		<!--2号Fastadmin弹窗公告-->
		<view class="announcement" v-if="isAnnouncementb&&Update!=1&&Updateb!=1">
			<view class="announcement-bg" @tap="isAnnouncementb=false">

			</view>
			<view class="announcement-main">
				<view class="announcement-title">
					APP公告
					<text class="cuIcon-close text-red" @tap="isAnnouncementb=false"></text>
				</view>
				<view class="announcement-concent">
					<rich-text :nodes="announcementb"></rich-text>
				</view>
				<view class="announcement-btn">
					<button class="cu-btn bg-gradual-blue lg" @tap="readAnnouncementb">我知道了</button>
				</view>
			</view>
		</view>

		<!--  #ifdef APP-PLUS -->
		<!--update-->
		<view class="update" v-if="Update==1">
			<view class="update-bg">
			</view>
			<view class="update-box">
				<view class="update-main">
					<image src="../../static/app-plus/ic_ar.png"></image>
					<view class="update-title">发现新版本：{{versionTitle}}</view>
					<view class="update-intro"><rich-text :nodes="versionIntro"></rich-text></view>
					<view class="update-btn grid col-2">
						<view class="update-btn-box">
							<view class="update-btn-main bg-blue" @tap="isUpdate(true)">
								更新
							</view>
						</view>
						<view class="update-btn-box">
							<view class="update-btn-main bg-gray" @tap="closeUpdate()">
								取消
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 2号FastAdmin后台更新 -->
		<view class="update" v-if="Updateb==1">
			<view class="update-bg">
			</view>
			<view class="update-box">
				<view class="update-main">
					<image src="../../static/app-plus/ic_ar.png"></image>
					<view class="update-title">发现新版本：{{versionTitleb}}</view>
					<view class="update-intro"><rich-text :nodes="versionIntrob"></rich-text></view>
					<view class="update-btn grid col-1" v-if="qzgx==1">
						<view class="update-btn-box">
							<view class="update-btn-main bg-gradual-pink" @tap="isUpdateb(true)">
								更新
							</view>
						</view>
					</view>
					<view class="update-btn grid col-2" v-else>
						<view class="update-btn-box">
							<view class="update-btn-main bg-gradual-pink" @tap="isUpdateb(true)">
								更新
							</view>
						</view>
						<view class="update-btn-box">
							<view class="update-btn-main bg-gray" @tap="closeUpdateb()">
								取消
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!--  #endif -->
		<!-- 2号FastAdmin后台更新end -->
		<!--  #ifdef APP-PLUS -->
		<view class="Startupmap" v-if="!isStart">
			<view class="Startupmap-close" @tap="toStart">
				<text>跳过</text>
			</view>
			<view class="Startupmap-close2">
				<text>广告</text>
			</view>
			<view class="Startupmap-pic" @tap="toStartUrl">
				<image :src="startImg.localUrl"></image>
			</view>
		</view>

		<view style="height: 100upx;"></view>
		<Tabbar :current="0"></Tabbar>
		<!--  #endif -->
		<!-- 组件开始 -->
		<!-- 	<u-popup :show="showPublish" @close="showPublish = false" customStyle="border-radius:20rpx 20rpx 0 0">
			<view style="padding: 30rpx;">
				<view style="text-align: center;">
					<text>{{$store.state.hasLogin?'有什么好玩的事~？':'请登录后再发表'}}</text>
				</view>
				<view class="publish-content">
					<view class="publish-content-article" @click="goPublish('articlePublish')">
						<text>帖子</text>
					</view>
					<view class="publish-content-photo" @click="goPublish('photo')">
						<text>图册</text>
					</view>
					<view class="publish-content-video" @click="goPublish('video')">
						<text>视频</text>
					</view>
				</view>
				<view style="display: flex;flex-direction: column;">
					<text style="font-size: 34rpx;">创作灵感</text>
					<text style="padding-left: 30rpx;font-size: 26rpx;">大家都想看的</text>
				</view>

				<block v-for="(item,index) in tags" :key="index">
					<view class="tag-content">
						<text>No{{index+1}} {{item.name}}</text>
					</view>
				</block>
			</view>
		</u-popup> -->
	</view>

</template>

<script>
	import waves from '@/components/xxley-waves/waves.vue';
	// #ifdef APP-PLUS
	// import Tabbar from '@/pages/components/tabBar.vue'
	// #endif
	import {
		localStorage
	} from '../../js_sdk/mp-storage/mp-storage/index.js'

	export default {
		// onTabItemTap() {
		// 	uni.$emit('midButtonClick');
		// },

		// name: "home",
		data() {
			return {
				// publish: [{
				// 						name: '帖子',
				// 						type: 'article',
				// 						icon: 'mgc_quill_pen_line',
				// 						path: 'articlePublish'
				// 					},
				// 					{
				// 						name: '图片',
				// 						type: 'picture',
				// 						icon: 'mgc_pic_line',
				// 						path: 'photo'
				// 					},
				// 					{
				// 						name: '视频',
				// 						type: 'video',
				// 						icon: 'mgc_play_circle_line',
				// 						path: 'video'
				// 					},
				// 				],
				// showPublish: false,

				tabbarIndex: 4,
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				NavBar: this.StatusBar + this.CustomBar,

				cardCur: 0,
				swiperList1: [],
				swiperList2: [],
				sousuok: '',
				bannerswitch: 0,
				adimage_sl: 0,
				homeadimage_sl: 10,
				gonggao_of: 0,
				lunbo_of: 1,
				top_of: 0,
				act_of: 0,
				hometop: 0,
				findtop: 0,
				noticeList: [],
				noticeText: "",
				announcement: "",
				isAnnouncement: false,
				announcementb: "",
				isAnnouncementb: false,

				gonggaotime: 86400000,
				//
				Update: 0,
				versionCode: 0,
				wgtVer: '',
				versionUrl: "",
				versionTitle: "",
				versionIntro: "",

				Updateb: 0,
				versionCodeb: 0,
				wgtVerb: '',
				versionUrlb: "",
				versionTitleb: "",
				versionIntrob: "",
				qzgx: 0,
				//
				startImg: {
					localUrl: ""
				},

				userList: [],
				tagList: [],

				contentsList: [],
				followcontentsList: [],

				topContents: [],
				metaList: [],

				dotStyle: false,
				towerStart: 0,
				direction: '100000',

				TabCur: 0,
				scrollLeft: 0,

				page: 1,
				moreText: "加载更多",

				isLoad: 0,

				token: "",

				isLoading: 0,
				isStart: false,

				dataLoad: false,

				pushAds: [],
				pushAdsInfo: null,
				bannerAds: [],
				bannerAdsInfo: null,

				noticeSum: 0,

				userInfo: null,
				token: "",
				noLogin: false,
				spaceDataType: 1,

				backButtonPress: 0,
				flag: 0,

				shopList: [],
				recommendList: [],
				featureList: [],
				featureLastTapAt: 0,
			}
		},

		onPullDownRefresh() {
			var that = this;
			that.loading();
			var timer = setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000)
		},
		// #ifdef MP
		onShareAppMessage(res) {
			var that = this;
			if (res.from === 'button') {
				// 来自页面内分享按钮
			}
			if (res.from === 'menu') {
				// 来自页面内分享按钮
			}
			var title = that.$API.GetAppName();
			var data = {
				title: title,
			}

			return data;

		},
		onShareTimeline() {
			var that = this;
			var title = that.$API.GetAppName();
			var data = {
				title: title,
			}
			return data;
		},
		// #endif
		onShow() {
			var that = this;
			if (localStorage.getItem('userinfo')) {
				that.userInfo = JSON.parse(localStorage.getItem('userinfo'));
				that.userInfo.style = "background-image:url(" + that.userInfo.avatar + ");"
				that.group = that.userInfo.group;
			} else {
				that.userInfo = null;
			}
			if (localStorage.getItem('token')) {

				that.token = localStorage.getItem('token');
			} else {
				that.token = "";
			}
			if (localStorage.getItem('appStyle')) {
				var appStyle = localStorage.getItem('appStyle');

				var curStyle = "blue";
				if (appStyle.indexOf("blue") != -1) {
					curStyle = "blue";
				}
				if (appStyle.indexOf("pink") != -1) {
					curStyle = "pink";
				}
				if (appStyle.indexOf("orange") != -1) {
					curStyle = "orange";
				}
				if (appStyle.indexOf("green") != -1) {
					curStyle = "green";
				}
				that.$store.state.AppStyle = that.appStyle;
				// that.$store.commit('setStyle', appStyle);
				console.log(that.$store.state.AppStyle)
			}
			if (localStorage.getItem('userinfo')) {
				that.userInfo = JSON.parse(localStorage.getItem('userinfo'));
				that.userInfo.style = "background-image:url(" + that.userInfo.avatar + ");"
				that.group = that.userInfo.group;
			} else {
				that.userInfo = null;
			}
			if (localStorage.getItem('token')) {
				that.token = localStorage.getItem('token');
			} else {
				that.token = "";
			}
			// #ifdef APP-PLUS || H5
			that.getAdsCache();
			that.getAds();
			// #endif

			//获取缓存
			that.allCache();
			if (localStorage.getItem('token')) {
				that.token = localStorage.getItem('token');
			}
			that.userStatus();
			that.unreadNum();
			that.getadimg();
			// #ifdef APP-PLUS
			// uni.hideTabBar({
			// 	animation: false
			// })
			//如果启动图还没有缓存过，第一次进来就不显示启动图了
			if (!localStorage.getItem('appStart')) {
				that.isStart = true;
			}
			plus.navigator.setStatusBarStyle("dark")
			//外部启动APP处理
			var args = plus.runtime.arguments;
			plus.runtime.arguments = null;
			plus.runtime.arguments = "";
			if (args) {
				//跳转到文章
				if (args.indexOf("?info=") != -1) {
					var arr = args.split("?info=");
					uni.navigateTo({
						url: '/pages/contents/info?cid=' + arr[1]
					});
				}
				//判断是否是扫码登录
				if (args.indexOf("?scan=") != -1) {
					var arr = args.split("?scan=");
					that.scanLogin(arr[1]);
				}
			}
			// #endif

		},
		onLoad() {
			var that = this;
			that.loading();
			// #ifdef APP-PLUS || MP
			that.NavBar = this.CustomBar;
			// #endif
			that.pageShow = true;
			let platform = uni.getSystemInfoSync().platform;
			localStorage.setItem('app_platform', platform);
			uni.getSystemInfo({
				success: function(res) {
					let model = ['X', 'XR', 'XS', '11', '12', '13', '14', '15'];
					console.log("当前设备型号：" + res.model)
					model.forEach(item => {

						//适配iphoneX以上的底部，给tabbar一定高度的padding-bottom
						if (res.model.indexOf(item) != -1 && res.model.indexOf('iPhone') != -1) {
							that.paddingBottomHeight = 40;
						}
					})
				}
			});
			setTimeout(function() {
				that.isStart = true;
			}, 5000);

			uni.onTabBarMidButtonTap(() => {
				console.log('666')
				this.showPublish = true
				uni.showActionSheet({

					itemList: ['帖子', '动态', '商品'],
					success(res) {
						const index = res.tapIndex;
						switch (index) {
							case 0:
								var that = this;
								if (!localStorage.getItem('token') || localStorage.getItem('token') ==
									"") {
									uni.showToast({
										title: "请先登录哦",
										icon: 'none'
									})
									return false;
								}
								uni.navigateTo({
									url: '/pages/edit/articleNew'
								})
								break
							case 1:
								var that = this;
								if (!localStorage.getItem('token') || localStorage.getItem('token') ==
									"") {
									uni.showToast({
										title: "请先登录哦",
										icon: 'none'
									})
									return false;
								}
								uni.navigateTo({
									url: '/pages/space/post?type=0'
								})
								break
							case 2:
								var that = this;
								if (!localStorage.getItem('token') || localStorage.getItem('token') ==
									"") {
									uni.showToast({
										title: "请先登录哦",
										icon: 'none'
									})
									return false;
								}
								uni.navigateTo({
									url: '/pages/edit/addshop'
								})
								break
						}
					},
					fail() {
						console.log('1')
					}
				})

			})
			// #ifdef APP-PLUS
			that.appStartImg();
			// that.isUpdate(false);
			that.isUpdateb(false);
			//#endif
		},
		onReachBottom() {
			//触底后执行的方法，比如无限加载之类的
			var that = this;
			if (that.isLoad == 0) {
				that.loadMore();
			}
		},
		mounted() {
			var that = this;
			that.getgg();
			that.loading();
			that.getAnnouncement();
			that.getAnnouncementb();
		},
		onBackPress() {
			// #ifdef APP-PLUS
			this.backButtonPress++;
			if (this.backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(() => {
				this.backButtonPress = 0;
			}, 1000);
			// #endif
			return true;
		},
		methods: {
			cardSwiper(e) {
				this.cardCur = e.detail.current
			},
			closeUpdate() {
				var that = this;
				that.Update = 0;
			},
			closeUpdateb() {
				var that = this;
				that.Updateb = 0;
			},
			getAnnouncement() {
				var that = this;
				if (localStorage.getItem('AppInfo')) {
					try {
						var AppInfo = JSON.parse(localStorage.getItem('AppInfo'));
						that.announcement = AppInfo.announcement || "";
						that.applyNoticeHtml(that.announcement);
						if (that.announcement != "" || AppInfo.announcement) {
							if (localStorage.getItem('isAnnouncement')) {
								var oldTime = Number(localStorage.getItem('isAnnouncement'));
								var curTime = new Date().getTime();
								var difference = curTime - oldTime;

								if (difference > 432000000) {
									that.isAnnouncement = true;
								}
							} else {
								that.isAnnouncement = true;
							}
						}
					} catch (e) {
						console.log(e);
					}
				} else {
					setTimeout(function() {
						that.getAnnouncement();
					}, 600);
				}
			},
			getAnnouncementb() {
				// FAST_URL(sb.520771.xyz) 已移除
			},
			isUpdate(Status) {
				var that = this;
				plus.runtime.getProperty(plus.runtime.appid, function(inf) {
					that.wgtVer = inf.version //获取当前版本号
					that.versionCode = inf.versionCode;
					var version = inf.versionCode;
					//从缓存里读取版本号
					if (localStorage.getItem('AppInfo')) {
						try {
							var AppInfo = JSON.parse(localStorage.getItem('AppInfo'));
							var versionCode = AppInfo.versionCode;
							let platform = uni.getSystemInfoSync().platform;
							if (platform == 'ios') {
								that.versionUrl = AppInfo.iosUrl;
							} else if (platform == 'android') {
								that.versionUrl = AppInfo.androidUrl;
							}
							that.versionTitle = AppInfo.version;
							that.versionIntro = AppInfo.versionIntro;
							if (Status) {
								// uni.showToast({
								// 	title:"检测完成",
								// 	icon:'none',
								// 	duration: 1000,
								// 	position:'bottom',
								// });
							}
							if (versionCode > version) {
								console.log("有更新");
								// uni.hideTabBar({
								// animation: true
								// })
								that.Update = 1;
								if (Status) {
									if (that.versionUrl != "") {
										plus.runtime.openURL(that.versionUrl);
									}
								}
							}
						} catch (e) {
							console.log(e);
						}

					}
				});
			},
			isUpdateb(Status) {
				// FAST_URL(sb.520771.xyz) 已移除
			},
			//获取客户端id用于消息通知
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
						"limit": 0,
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
						// console.log(res)
						uni.showToast({
							title: "网络开小差了哦",
							icon: 'none'
						})
					}
				})
			},
			//获取并缓存广告
			getAds() {
				var that = this;
				// #ifdef APP-PLUS || H5
				//获取推流广告
				that.getAdsList(0);
				//获取横幅广告
				that.getAdsList(1);
				//#endif
				// #ifdef APP-PLUS
				//获取启动图广告
				that.getAdsList(2);
				//#endif
			},
			getAdsCache() {
				var that = this;
				if (localStorage.getItem('pushAds')) {
					that.pushAds = JSON.parse(localStorage.getItem('pushAds'));
				}
				if (localStorage.getItem('bannerAds')) {
					that.bannerAds = JSON.parse(localStorage.getItem('bannerAds'));
					var num = that.bannerAds.length;
					if (num > 0) {
						var rand = Math.floor(Math.random() * num);
						that.bannerAdsInfo = that.bannerAds[rand];
					}
				}
			},
			getAdsList(type) {
				var that = this;
				var data = {
					"type": type,
					"status": "1",
				}
				that.$Net.request({
					url: that.$API.adsList(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 100,
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						// console.log("adsList"+JSON.stringify(res))
						if (res.data.code == 1) {
							var list = res.data.data;
							if (type == 0) {
								that.pushAds = res.data.data;
								localStorage.setItem('pushAds', JSON.stringify(that.pushAds));
							}
							if (type == 1) {
								that.bannerAds = res.data.data;
								localStorage.setItem('bannerAds', JSON.stringify(that.bannerAds));
							}
							if (type == 2) {
								that.startAds = res.data.data;
								localStorage.setItem('startAds', JSON.stringify(that.startAds));
								// console.log(localStorage.getItem('startAds'))
							}
						}
					},
					fail: function(res) {

					}
				})
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
			tabSelect(e) {
				var that = this;
				that.TabCur = e.currentTarget.dataset.id;
				that.page = 1;
				that.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
				that.contentsList = [];
				that.dataLoad = false;
				if (that.TabCur == 0) {
					that.getContentsList(false);
					that.getTopContents(false);
				} else {
					that.getMetaContents(false, that.TabCur);
				}
			},
			//全部请求
			loading() {
				var that = this;
				that.page = 1;
				that.getSwiper();
				that.getFeatureList();
				that.getMetaList();
				that.getTopContents();
				that.getShopList();
				that.getUserList();
				that.getTagList();
				that.getRecommend();
				that.getCID();
				that.unreadNum();
				if (that.page < 2) {
					if (that.TabCur == 0) {
						if (that.spaceDataType == 0) {
							that.getfollowContentsList(false);
						} else {
							that.getContentsList(false);
						}

					} else {
						that.getMetaContents(false, that.TabCur);
					}
				}
			},
			loadMore() {
				var that = this;
				that.moreText = "正在加载中...";
				that.isLoad = 1;
				if (that.TabCur == 0) {
					console.log(that.spaceDataType)
					if (that.spaceDataType == 0) {
						that.getfollowContentsList(true);
					} else {
						that.getContentsList(true);
					}

				} else {
					that.getMetaContents(true, that.TabCur);
				}
			},
			//公共缓存
			allCache() {
				var that = this;
				var meta = that.TabCur;
				if (localStorage.getItem('swiperList')) {
					that.swiperList = JSON.parse(localStorage.getItem('swiperList'));
					var timer = setTimeout(function() {
						that.isLoading = 1;
						clearTimeout('timer')
					}, 300)
				}
				if (localStorage.getItem('swiperList1')) {
					that.swiperList1 = JSON.parse(localStorage.getItem('swiperList1'));
					that.homeadimage_sl = that.swiperList1.length;
					that.lunbo_of = that.swiperList1.length > 0 ? 1 : 0;
					var timer = setTimeout(function() {
						that.isLoading = 1;
						clearTimeout('timer')
					}, 300)
				}
				if (localStorage.getItem('recommendList')) {
					that.recommendList = JSON.parse(localStorage.getItem('recommendList'));
				}
				if (localStorage.getItem('homeFeatureList')) {
					try {
						that.featureList = JSON.parse(localStorage.getItem('homeFeatureList')) || [];
					} catch (e) {
						that.featureList = [];
					}
				}
				if (localStorage.getItem('homeNoticeText')) {
					that.noticeText = localStorage.getItem('homeNoticeText');
					that.noticeList = that.noticeText ? [that.noticeText] : [];
					that.gonggao_of = that.noticeText ? 1 : 0;
				}
				if (localStorage.getItem('metaList')) {
					that.metaList = JSON.parse(localStorage.getItem('metaList'));
				}
				if (localStorage.getItem('contentsList_' + meta)) {
					that.contentsList = JSON.parse(localStorage.getItem('contentsList_' + meta));
				}
				if (localStorage.getItem('topContents')) {
					that.topContents = JSON.parse(localStorage.getItem('topContents'));
				}
			},
			getSwiper() {
				var that = this;
				var token = "";
				if (localStorage.getItem('token')) {
					token = localStorage.getItem('token');
				}
				that.$Net.request({
					url: that.$API.homeBannerList(),
					data: {
						"limit": 10,
						"token": token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1) {
							var list = res.data.data || [];
							var swiper = [];
							for (var i = 0; i < list.length; i++) {
								var item = list[i];
								if (!item.image) {
									continue;
								}
								swiper.push({
									id: item.id,
									type: 'image',
									url: item.image,
									title: item.title || '',
									linkType: item.linkType || 0,
									linkValue: item.linkValue || '',
									zt: ''
								});
							}
							that.swiperList1 = swiper;
							that.homeadimage_sl = swiper.length;
							that.lunbo_of = swiper.length > 0 ? 1 : 0;
							localStorage.setItem('swiperList1', JSON.stringify(that.swiperList1));
						}
					},
					fail: function(res) {

					}
				})
			},
			getFeatureList() {
				var that = this;
				var token = "";
				if (localStorage.getItem('token')) {
					token = localStorage.getItem('token');
				}
				that.$Net.request({
					url: that.$API.homeFeatureList(),
					data: {
						"limit": 10,
						"token": token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1) {
							var list = res.data.data || [];
							that.featureList = list;
							try {
								localStorage.setItem('homeFeatureList', JSON.stringify(list));
							} catch (e) {}
						}
					},
					fail: function(res) {}
				})
			},
			featureIconColor(index) {
				var colors = [
					'#4285F4',
					'#9C6BFF',
					'#FF6B8A',
					'#FF9F43',
					'#26C6DA',
					'#5C6BC0',
					'#27AE60',
					'#E74C3C'
				];
				return colors[(index || 0) % colors.length];
			},
			featureTextIcon(name) {
				name = (name || '').trim();
				return name ? name.charAt(0) : '';
			},
			onFeatureTap(item) {
				var that = this;
				if (!item) {
					return;
				}
				var now = Date.now();
				if (that.featureLastTapAt && now - that.featureLastTapAt < 500) {
					return;
				}
				that.featureLastTapAt = now;
				that.jumpFeature(item.linkType || 0, item.linkValue || '');
			},
			jumpFeature(linkType, linkValue) {
				var that = this;
				linkType = parseInt(linkType) || 0;
				linkValue = (linkValue || '').trim();
				if (linkType == 0) {
					return;
				}
				if (!linkValue) {
					uni.showToast({
						title: "该内容暂未配置跳转目标",
						icon: 'none'
					});
					return;
				}
				if (linkType == 1) {
					uni.navigateTo({
						url: '/pages/contents/info?cid=' + linkValue
					});
					return;
				}
				if (linkType == 2) {
					that.goAds2(linkValue);
					return;
				}
				if (linkType == 3) {
					that.jumpFeatureRoute(linkValue);
					return;
				}
				if (linkType == 4) {
					uni.showToast({
						title: "应用详情暂不支持打开",
						icon: 'none'
					});
					return;
				}
				uni.showToast({
					title: "暂不支持的跳转类型",
					icon: 'none'
				});
			},
			jumpFeatureRoute(routeKey) {
				var that = this;
				var map = {
					blackhouse: '/pages/contents/blackhouse',
					shop: '/pages/shop/shop',
					propcenter: '',
					checkin: '/pages/user/checkin',
					activity: '/pages/activity/center',
					game: '',
					applist: '',
					invite: '',
					recommend: '/pages/contents/recommend',
					randlist: '/pages/contents/randlist',
					imagetoday: '/pages/contents/imagetoday',
					comments: '/pages/contents/comments',
					foreverblog: '/pages/contents/foreverblog',
					tool: '/pages/home/tool',
					buy_ad: '/pages/ads/home',
					ads: '/pages/ads/home',
					square: '/pages/home/square',
					find: '/pages/home/find',
					search: '/pages/contents/search',
					alltag: '/pages/contents/alltag',
					allcategory: '/pages/contents/allcategory'
				};
				var url = map[routeKey];
				if (url) {
					uni.navigateTo({
						url: url
					});
					return;
				}
				uni.showToast({
					title: "该功能模块暂不支持打开",
					icon: 'none'
				});
			},
			getRecommend() {
				var that = this;
				var data = {
					"type": "post",
					"isrecommend": 1
				}
				var token = "";
				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;
				}
				that.$Net.request({
					url: that.$API.getContentsList(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 5,
						"page": 1,
						"order": "modified DESC",
						"token": token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						// console.log(res)
						if (res.data.code == 1) {
							that.noLogin = false;
							var list = res.data.data;
							if (list.length > 0) {
								that.recommendList = list;
							} else {
								that.recommendList = [];
							}
							localStorage.setItem('recommendList', JSON.stringify(that.recommendList));
						} else {
							if (res.data.msg == "用户未登录或Token验证失败") {
								that.noLogin = true;
							}
						}
					},
					fail: function(res) {

					}
				})
			},
			toRecommend() {
				var that = this;

				uni.navigateTo({
					url: '/pages/contents/recommend'
				});
			},
			getMetaList() {
				var that = this;
				var data = {
					"type": "category"
				}
				that.$Net.request({
					url: that.$API.getMetasList(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 15,
						"page": 1,
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1) {
							var list = res.data.data;
							if (list.length > 0) {
								var meta = [{
									mid: 0,
									name: "推荐",
									parent: 0,
								}];
								that.metaList = meta.concat(list);

							} else {
								that.metaList = [];
							}
							localStorage.setItem('metaList', JSON.stringify(that.metaList));
						}
						var timer = setTimeout(function() {
							// that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
					},
					fail: function(res) {
						var timer = setTimeout(function() {
							// that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
					}
				})
			},
			getTopContents() {
				var that = this;
				var data = {
					"type": "post",
					"istop": 1,
				}
				var token = "";
				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;
				}
				that.$Net.request({
					url: that.$API.getContentsList(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 10,
						"page": 1,
						// "order": "modified",
						"order": "commentsNum DESC",

						"token": token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1) {
							var list = res.data.data;

							if (list.length > 0) {

								var contentsList = [];
								//将自定义字段获取并添加到数据
								var curFields = that.$API.GetFields();
								for (var i in list) {
									var fields = list[i].fields;
									if (fields.length > 0) {
										for (var j in fields) {
											if (curFields.indexOf(fields[j].name) != -1) {
												list[i][fields[j].name] = fields[j].strValue;
											}
										}
									}
									contentsList.push(list[i]);
								}

								that.topContents = contentsList;
							} else {
								that.topContents = [];
							}
							localStorage.setItem('topContents', JSON.stringify(that.topContents));
						}
					},
					fail: function(res) {}
				})
			},
			setspaceDataType(type) {
				var that = this;
				that.spaceDataType = type;
				// that.spaceLoad = false;
				that.page = 1;
				that.dataLoad = false;
				that.moreText = "加载更多";
				if (type == 0) {
					that.followcontentsList = [];
					// 关注流需登录；未登录时模板显示登录引导，不发无效请求
					if (that.token) {
						that.getfollowContentsList(false);
					}
				} else {
					that.contentsList = [];
					that.getContentsList(false);
				}
			},
			getContentsList(isPage, type) {
				var that = this;
				var data = {
					"type": "post",
					"istop": 0,
				}
				var token = "";
				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;
				}
				var page = that.page;
				if (isPage) {
					page++;
				}
				var spaceDataType = that.spaceDataType;

				// 后端 safeOrder 无方向词时只输出列名 → MySQL 默认 ASC；
				// 必须带 DESC，否则最新/回复/最热会变成倒序最旧/最少评论
				var order = "created DESC";
				if (spaceDataType == 1) {
					order = "created DESC";
				}
				if (spaceDataType == 2) {
					order = "replyTime DESC";
				}
				if (spaceDataType == 3) {
					order = "commentsNum DESC";
				}

				that.$Net.request({
					url: that.$API.getContentsList(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 4,
						"page": page,
						"order": order,
						"token": token
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						that.isLoad = 0;
						that.moreText = "加载更多";
						if (!isPage) {
							that.dataLoad = true;
						}
						if (res.data.code == 1) {
							var list = res.data.data;
							if (list.length > 0) {
								var num = res.data.data.length;
								var rand = Math.floor(Math.random() * num);
								var pushAdsInfo = null;
								// #ifdef APP-PLUS || H5
								if (localStorage.getItem('pushAds')) {
									var pushAds = JSON.parse(localStorage.getItem('pushAds'));
									var adsNum = pushAds.length;
									if (adsNum > 0) {
										var adsRand = Math.floor(Math.random() * adsNum);
										pushAdsInfo = that.pushAds[adsRand];
										pushAdsInfo.isAds = 1;
									}

								}

								// #endif
								var contentsList = [];
								//将自定义字段获取并添加到数据
								var curFields = that.$API.GetFields();
								for (var i in list) {
									var fields = list[i].fields;
									if (fields.length > 0) {
										for (var j in fields) {
											if (curFields.indexOf(fields[j].name) != -1) {
												list[i][fields[j].name] = fields[j].strValue;
											}
										}
									}
									contentsList.push(list[i]);

									// #ifdef APP-PLUS || H5
									var isAds = Math.round(Math.random());

									if (isAds == 1) {
										if (i == rand && pushAdsInfo != null) {
											contentsList.push(pushAdsInfo);

										}
									}
									// #endif
								}
								var num = contentsList.length;
								if (isPage) {
									that.page++;
									that.contentsList = that.contentsList.concat(contentsList);
								} else {
									that.contentsList = contentsList;
								}
								localStorage.setItem('contentsList_0', JSON.stringify(that.contentsList));
								// console.log(contentsList)
							} else {
								if (!isPage) {
									that.contentsList = [];
								}
								that.moreText = "没有更多文章了";
							}
						} else if (!isPage) {
							that.contentsList = [];
							that.moreText = res.data.msg || "加载失败";
						}
					},
					fail: function(res) {
						that.moreText = "加载更多";
						that.isLoad = 0;
						if (!isPage) {
							that.dataLoad = true;
							that.contentsList = [];
						}
					}
				})
			},
			getfollowContentsList(isPage, type) {
				var that = this;
				var data = {
					"type": "post",
					"istop": 0,
				}
				var token = "";
				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;
				}
				var page = that.page;
				if (isPage) {
					page++;
				}
				var order = "created DESC";
				// followContents 后端固定 created DESC，此处保持参数一致
				that.$Net.request({
					url: that.$API.getfollowContents(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 4,
						"page": page,
						"order": order,
						"token": token
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						that.isLoad = 0;
						that.moreText = "加载更多";
						if (!isPage) {
							that.dataLoad = true;
						}
						if (res.data.code == 1) {
							var list = res.data.data;
							if (list.length > 0) {
								var num = res.data.data.length;
								var rand = Math.floor(Math.random() * num);
								var pushAdsInfo = null;
								// #ifdef APP-PLUS || H5
								if (localStorage.getItem('pushAds')) {
									var pushAds = JSON.parse(localStorage.getItem('pushAds'));
									var adsNum = pushAds.length;
									if (adsNum > 0) {
										var adsRand = Math.floor(Math.random() * adsNum);
										pushAdsInfo = that.pushAds[adsRand];
										pushAdsInfo.isAds = 1;
									}
								}
								// #endif
								var followcontentsList = [];
								//将自定义字段获取并添加到数据
								var curFields = that.$API.GetFields();
								for (var i in list) {
									var fields = list[i].fields;
									if (fields.length > 0) {
										for (var j in fields) {
											if (curFields.indexOf(fields[j].name) != -1) {
												list[i][fields[j].name] = fields[j].strValue;
											}
										}
									}
									followcontentsList.push(list[i]);
									// #ifdef APP-PLUS || H5
									var isAds = Math.round(Math.random());
									if (isAds == 1) {
										if (i == rand && pushAdsInfo != null) {

											followcontentsList.push(pushAdsInfo);
										}
									}
									// #endif
								}
								var num = followcontentsList.length;
								if (isPage) {
									that.page++;
									that.followcontentsList = that.followcontentsList.concat(
										followcontentsList);
								} else {
									that.followcontentsList = followcontentsList;
								}
								localStorage.setItem('follow_contentsList_0', JSON.stringify(that
									.followcontentsList));

							} else {
								if (!isPage) {
									that.followcontentsList = [];
								}
								that.moreText = "没有更多文章了";
							}
						} else if (!isPage) {
							that.followcontentsList = [];
							that.moreText = res.data.msg || "加载失败";
						}
					},
					fail: function(res) {
						that.moreText = "加载更多";
						that.isLoad = 0;
						if (!isPage) {
							that.dataLoad = true;
							that.followcontentsList = [];
						}
					}
				})
			},
			getMetaContents(isPage, meta) {
				var that = this;
				var data = {
					"mid": meta,
					"type": "post"
				}
				var token = "";
				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;
				}
				var page = that.page;
				if (isPage) {
					page++;
				}
				that.$Net.request({
					url: that.$API.getMetaContents(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 5,
						"page": page,
						"order": "created DESC",
						"token": token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (!isPage) {
							that.dataLoad = true;
						}
						that.isLoad = 0;

						that.moreText = "加载更多";
						if (res.data.code == 1) {
							var list = res.data.data;
							if (list.length > 0) {
								var contentsList = [];
								//将自定义字段获取并添加到数据
								var curFields = that.$API.GetFields();
								for (var i in list) {
									var fields = list[i].fields;
									if (fields.length > 0) {
										for (var j in fields) {
											if (curFields.indexOf(fields[j].name) != -1) {
												list[i][fields[j].name] = fields[j].strValue;
											}
										}
									}
									contentsList.push(list[i]);
								}
								if (isPage) {
									that.page++;
									that.contentsList = that.contentsList.concat(contentsList);
								} else {
									that.contentsList = contentsList;
								}

								localStorage.setItem('contentsList_' + meta, JSON.stringify(that
									.contentsList));
							} else {
								that.moreText = "没有更多文章了";
							}
						}
					},
					fail: function(res) {

						that.moreText = "加载更多";
						that.isLoad = 0;
					}
				})
			},
			userStatus() {
				var that = this;
				that.$Net.request({

					url: that.$API.userStatus(),
					data: {
						"token": that.token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 0 || res.data.code == 401) {
							localStorage.removeItem('userinfo');
							localStorage.removeItem('token');
							that.token = "";
							that.userinfo = null;
							that.userInfo = null;
						}
					},
					fail: function(res) {
						// console.log(res)
						uni.showToast({
							title: "网络开小差了哦",
							icon: 'none'
						})
					}
				})
			},
			unreadNum() {
				var that = this;
				var token = ""
				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;
				}
				that.$Net.request({
					url: that.$API.unreadNum(),
					data: {
						"token": token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1) {
							var noticeSum = res.data.data.total;
							localStorage.setItem('noticeSum', noticeSum);
							// that.noticeSum = noticeSum;
							that.noticeSum = Number(localStorage.getItem('noticeSum'));
							if (noticeSum > 0) {
								uni.setTabBarBadge({
									index: 2,
									text: that.noticeSum.toString()
								})
							} else {
								uni.hideTabBarRedDot({
									index: 2
								})
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
			readAnnouncement() {
				var that = this;
				that.isAnnouncement = false;
				var timestamp = new Date().getTime();
				localStorage.setItem('isAnnouncement', timestamp);

			},
			readAnnouncementb() {
				var that = this;
				that.isAnnouncementb = false;
				var timestamp = new Date().getTime();
				localStorage.setItem('isAnnouncementb', timestamp);
			},
			toForeverblog() {
				var that = this;

				uni.navigateTo({
					url: '/pages/contents/foreverblog'
				});

			},
			toSearch() {
				var that = this;
				if (that.noLogin) {
					uni.navigateTo({
						url: '/pages/user/login'
					});
					return false;
				}
				uni.navigateTo({
					url: '/pages/contents/search'
				});

			},
			toCategoryContents(title, id) {
				var that = this;
				var type = "meta";
				uni.navigateTo({
					url: '/pages/contents/contentlist?title=' + title + "&type=" + type + "&id=" + id
				});
			},
			toAllContents() {
				var that = this;
				var type = "all";
				var title = "全部文章";
				uni.navigateTo({
					url: '/pages/contents/contentlist?title=' + title + "&type=" + type + "&id=0"
				});
			},
			toInfo(data) {
				var that = this;
				uni.navigateTo({
					url: '/pages/contents/info?cid=' + data.cid + "&title=" + data.title
				});
			},
			goLogin() {
				uni.navigateTo({
					url: '/pages/user/login'
				});
			},
			goRegister() {
				uni.navigateTo({
					url: '/pages/user/register'
				});
			},
			subText(text, num) {
				if (text.length < null) {
					return text.substring(0, num) + "……"
				} else {
					return text;
				}

			},

			formatDate(datetime) {
				var datetime = new Date(parseInt(datetime * 1000));
				var year = datetime.getFullYear(),
					month = ("0" + (datetime.getMonth() + 1)).slice(-2),
					date = ("0" + datetime.getDate()).slice(-2),
					hour = ("0" + datetime.getHours()).slice(-2),
					minute = ("0" + datetime.getMinutes()).slice(-2);
				var result = year + "-" + month + "-" + date + " " + hour + ":" + minute;
				return result;
			},
			getadimg() {
				// FAST_URL(sb.520771.xyz) 已移除
			},
			stripHtml(html) {
				return String(html || '')
					.replace(/<br\s*\/?>/gi, ' ')
					.replace(/<\/(p|div|li|tr|h[1-6])>/gi, ' ')
					.replace(/<[^>]+>/g, '')
					.replace(/&nbsp;/gi, ' ')
					.replace(/&amp;/gi, '&')
					.replace(/&lt;/gi, '<')
					.replace(/&gt;/gi, '>')
					.replace(/&quot;/gi, '"')
					.replace(/&#39;/gi, "'")
					.replace(/\s+/g, ' ')
					.trim();
			},
			applyNoticeHtml(html) {
				var that = this;
				var plain = that.stripHtml(html);
				that.noticeText = plain;
				that.noticeList = plain ? [plain] : [];
				that.gonggao_of = plain ? 1 : 0;
				if (plain) {
					try {
						localStorage.setItem('homeNoticeText', plain);
					} catch (e) {}
				} else {
					try {
						localStorage.removeItem('homeNoticeText');
					} catch (e) {}
				}
			},
			getgg() {
				var that = this;
				var raw = "";
				var retries = 0;
				if (localStorage.getItem('homeNoticeText')) {
					try {
						that.noticeText = localStorage.getItem('homeNoticeText');
						that.noticeList = that.noticeText ? [that.noticeText] : [];
						that.gonggao_of = that.noticeText ? 1 : 0;
					} catch (e) {}
				}
				var loadFromAppInfo = function() {
					if (!localStorage.getItem('AppInfo')) {
						retries++;
						if (retries < 8) {
							setTimeout(loadFromAppInfo, 500);
						}
						return;
					}
					try {
						var AppInfo = JSON.parse(localStorage.getItem('AppInfo'));
						raw = AppInfo.announcement || "";
					} catch (e) {
						raw = "";
					}
					that.applyNoticeHtml(raw);
				};
				loadFromAppInfo();
			},
			swiperclick1(index) {
				var that = this;
				const data = that.swiperList1[index];
				if (!data) {
					return;
				}
				var linkType = data.linkType || 0;
				var linkValue = data.linkValue || "";
				if (linkType == 0 || !linkValue) {
					return;
				}
				if (linkType == 1) {
					uni.navigateTo({
						url: '/pages/contents/info?cid=' + linkValue
					});
					return;
				}
				if (linkType == 2) {
					that.goAds2(linkValue);
					return;
				}
				if (linkType == 3) {
					uni.navigateTo({
						url: '/pages/shop/shopinfo?sid=' + linkValue
					});
				}
			},
			swiperclick(index) {
				var that = this;
				const data = that.swiperList2[index];
				that.goAds2(data.zt);
			},
			goAds2(url) {
				if (url.includes('http')) {
					// #ifdef APP-PLUS
					plus.runtime.openWeb(url);
					// #endif
					// #ifdef H5
					window.open(url);
					// #endif
				} else {
					uni.navigateTo({
						url: url
					});
				}
			},
			toUsersexp() {
				var that = this;
				if (!localStorage.getItem('token')) {
					uni.showToast({
						title: "请先登录！",
						icon: 'none'
					})
					return false;
				}
				uni.navigateTo({
					url: '/pages/user/userexp'
				});
			},
			toCheckin() {
				if (!localStorage.getItem('token')) {
					uni.showToast({
						title: "请先登录！",
						icon: 'none'
					})
					return false;
				}
				uni.navigateTo({
					url: '/pages/user/checkin'
				});
			},
			toGroup() {
				// FAST_URL(sb.520771.xyz) 已移除
			},
			formatNumber(num) {
				return num >= 1e3 && num < 1e4 ? (num / 1e3).toFixed(1) + 'k' : num >= 1e4 ? (num / 1e4).toFixed(1) + 'w' :
					num
			},
			toImagetoday() {
				var that = this;
				uni.navigateTo({
					url: '/pages/contents/imagetoday'
				});
			},
			goPage(url) {
				var that = this;
				uni.navigateTo({
					url: url
				});
			},
			getShopList() {
				var that = this;
				var data = {
					"status": "1",
					"isView": "1"
				}
				that.$Net.request({
					url: that.$API.shopList(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 4,
						"page": 1,
						"order": "sellNum"
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1) {
							var list = res.data.data;
							that.shopList = list;
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
			goUserInfo() {
				var that = this;
				if (!localStorage.getItem('token') || localStorage.getItem('token') == "") {
					uni.navigateTo({
						url: '/pages/user/login'
					});
					return false;
				}
				uni.$emit('goUser', 0);
			},
			getUserList() {
				var that = this;
				var token = ""
				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;
				}
				that.$Net.request({
					url: that.$API.getUserList(),
					data: {
						"searchParams": "",
						"limit": 5,
						"page": 1,
						"order": "posttime",
						"token": token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1) {
							var list = res.data.data;
							if (list.length > 0) {
								var userList = [];
								for (var i in list) {
									var arr = list[i];
									arr.style = "background-image:url(" + list[i].avatar + ");"
									userList.push(arr);
								}
								that.userList = userList;
							}
						}
					},
					fail: function(res) {}
				})
			},
			getTagList() {
				var that = this;
				var data = {
					"type": "tag"
				}
				that.$Net.request({
					url: that.$API.getMetasList(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 20,
						"page": 1,
						"order": "count"
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1) {
							var list = res.data.data;
							if (list.length > 0) {
								that.tagList = list;
								localStorage.setItem('find_tagList', JSON.stringify(that.tagList));
							}
						}
					},
					fail: function(res) {}
				})
			},
			toAlltag() {
				var that = this;

				uni.navigateTo({
					url: '/pages/contents/alltag'
				});
			},
			toMetas() {
				var that = this;

				uni.navigateTo({
					url: '/pages/contents/metas'
				});
			},
			goCategory() {
				var that = this;
				uni.navigateTo({
					url: '/pages/contents/allcategory'
				});
			},
			toRand() {
				var that = this;
				uni.navigateTo({
					url: '/pages/contents/randlist'
				});
			},
			replaceSpecialChar(text) {
				text = text.replace(/&quot;/g, '"');
				text = text.replace(/&amp;/g, '&');
				text = text.replace(/&lt;/g, '<');
				text = text.replace(/&gt;/g, '>');
				text = text.replace(/&nbsp;/g, ' ');
				return text;
			},
			toLink(text) {
				var that = this;
				if (!localStorage.getItem('token') || localStorage.getItem('token') == "") {
					uni.showToast({
						title: "请先登录哦",
						icon: 'none'
					})
					return false;
				}
				uni.switchTab({
					url: text
				})
				// uni.navigateTo({
				// 	url: text
				// });
			},
			toScan() {
				var that = this;
				uni.scanCode({
					onlyFromCamera: false,
					scanType: ['barCode', 'qrCode'],
					success: function(res) {
						var text = res.result;
						var strUrl = "^((https|http|ftp|rtsp|mms)?://)" +
							"?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" +
							"(([0-9]{1,3}\.){3}[0-9]{1,3}" +
							"|" +
							"([0-9a-z_!~*'()-]+\.)*" +
							"([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." +
							"[a-z]{2,6})" +
							"(:[0-9]{1,4})?" +
							"((/?)|" +
							"(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
						var urlDemo = new RegExp(strUrl);
						if (urlDemo.test(text)) {
							var linkRule = that.$API.GetLinkRule();
							var linkRuleArr = linkRule.split("{cid}");
							if (text.indexOf(linkRuleArr[0]) != -1) {
								//是本站链接
								var cid = text;
								for (var i in linkRuleArr) {
									cid = cid.replace(linkRuleArr[i], "");
								}
								uni.navigateTo({
									url: '/pages/contents/info?cid=' + cid
								});
							} else {
								// #ifdef MP
								uni.setClipboardData({
									data: href,
									success: () =>
										uni.showToast({
											title: '链接已复制'
										})
								})
								// #endif
								// #ifdef APP-PLUS
								plus.runtime.openWeb(href)
								// #endif
							}
						} else {
							that.scanLogin(text);
						}
					}
				});
			},
			scanLogin(text) {
				var that = this;
				var token;
				if (!localStorage.getItem('token')) {
					uni.showToast({
						title: "请先登录",
						icon: 'none'
					})
					return false;
				}
				uni.navigateTo({
					url: '/pages/user/scan?text=' + text
				});
			},
			//自定义启动图广告相关
			toStartUrl() {
				if (localStorage.getItem('appStart')) {
					var imgData = JSON.parse(localStorage.getItem('appStart'));
					//如果线上的图片与本地缓存图片相同，就不再进行下载
					if (imgData.url) {
						var url = imgData.url;
						var type = imgData.urltype;
						if (url.indexOf("http") != -1) {
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

						} else {
							uni.navigateTo({
								url: url
							});
						}

					} else {
						return false
					}

				} else {
					return false
				}
			},
			toStart() {
				var that = this;
				that.isStart = true;
			},
			appStartImg() {
				var that = this;
				// #ifdef APP-PLUS
				if (localStorage.getItem('appStart')) {
					var imgData = JSON.parse(localStorage.getItem('appStart'));

					if (!imgData.localUrl || imgData.localUrl == "") {
						console.log("启动图文件本地不存在");
						localStorage.removeItem('appStart');
						that.isStart = true;
						return false;
					}
					var localUrl = imgData.localUrl;
					//在请求之前，先为了性能载入上次图片
					plus.io.resolveLocalFileSystemURL(imgData.localUrl, function(entry) {
						console.log("启动图文件本地存在");
						imgData.localUrl = localUrl;
						that.startImg = imgData;

						that.isStart = false;
					}, function(e) {
						console.log("启动图文件本地不存在");
						localStorage.removeItem('appStart');
						that.isStart = true;
					});
				} else {
					console.log("启动图未缓存")
				}
				if (localStorage.getItem('startAds')) {
					var data = JSON.parse(localStorage.getItem('startAds'));
					var adsNum = data.length;
					console.log(data.status)
					if (adsNum > 0) {
						var adsRand = Math.floor(Math.random() * adsNum);
						var appStartPic = data[adsRand].img;
						if (appStartPic != "") {
							appStartPic = appStartPic.replace(/[\r\n]/g, "");
							var imgData = data[adsRand];
							imgData.appStartPic = appStartPic;
							that.Download(imgData);
						}
					} else {
						console.log("广告信息不存在，删除缓存");
						localStorage.removeItem('appStart');
						that.isStart = true;
					}
				}
				// #endif
			},
			Download(startImg) {
				var that = this;
				// #ifdef APP-PLUS
				var url = startImg.appStartPic;
				if (localStorage.getItem('appStart')) {
					var imgData = JSON.parse(localStorage.getItem('appStart'));
					//如果线上的图片与本地缓存图片相同，就不再进行下载
					if (url == imgData.appStartPic) {
						console.log("启动图不更新");
						//但是链接可能变化，所以需要载入缓存
						var oldStartImg = imgData;
						localStorage.setItem('appStart', JSON.stringify(oldStartImg));
						return false;
					}
				}
				uni.downloadFile({
					url: url, //下载地址接口返回
					success: (data) => {
						if (data.statusCode === 200) {
							//文件保存到本地
							uni.saveFile({
								tempFilePath: data.tempFilePath, //临时路径
								success: function(res) {
									// uni.showToast({
									// 	icon: 'none',
									// 	mask: true,
									// 	title: '文件已保存：' + res.savedFilePath, //保存路径
									// 	duration: 3000,
									// });
									startImg.localUrl = res.savedFilePath;
									localStorage.setItem('appStart', JSON.stringify(startImg));
									console.log("启动图已更新" + startImg.localUrl);

									that.startImg = startImg;
								}
							});
						}
					},
					fail: (err) => {
						console.log(err);
						// uni.showToast({
						// 	icon: 'none',
						// 	mask: true,
						// 	title: '失败请重新下载',
						// });
					},
				});
				// #endif
			},
			toUserContents(data) {
				var that = this;
				var name = data.name;
				var title = data.name + "的信息";
				if (data.screenName) {
					title = data.screenName + " 的信息";
					name = data.screenName
				}
				var id = data.uid;
				var type = "user";
				uni.navigateTo({
					url: '/pages/contents/userinfo?title=' + title + "&name=" + name + "&uid=" + id + "&avatar=" +
						encodeURIComponent(data.avatar)
				});
			},
		},

		// #ifdef APP-PLUS
		components: {
			waves
			// Tabbar
		},
		// #endif
		// #ifdef H5 || MP
		components: {
			waves
			// 'tabbar': {
			// 	// 组件选项
			// }
		},
		// #endif
	}
</script>

<style lang="scss" scoped>
	@import '@/static/css/templatePage/custom_nav_bar.scss';

	/* 加载 */
	.load {
		position: absolute;
		top: 50%;
		left: 42%;
		transform: translate(-50%, -50%);
		width: 60px;
		height: 60px;
	}

	.load text {
		border: 0;
		margin: 0;
		width: 40%;
		height: 40%;
		position: absolute;
		border-radius: 50%;
		animation: spin 2s ease infinite
	}

	.load :first-child {
		background: #4B98FE;
		animation-delay: -1.5s
	}

	.load :nth-child(2) {
		background: #00D05E;
		animation-delay: -1s
	}

	.load :nth-child(3) {
		background: #FFAC00;
		animation-delay: -0.5s
	}

	.load :last-child {
		background: #FB6A67
	}

	@keyframes spin {

		0%,
		100% {
			transform: translate(0)
		}

		25% {
			transform: translate(160%)
		}

		50% {
			transform: translate(160%, 160%)
		}

		75% {
			transform: translate(0, 160%)
		}
	}


	.tab-wrap-index {
		color: #454545;
		position: relative;
		z-index: 1;
	}

	.tab-wrap-index::after {
		position: absolute;
		border-radius: 50px;
		color: #797979;
		right: 5%;
		bottom: 6rpx;
		z-index: -1;
		display: block;
		content: "";
		width: 100%;
		height: 13rpx;
		background-color: #3cc9a4;
	}

	.square-box {
		font-weight: bold;
		font-size: 17px;
	}

	.square-box {
		font-weight: bold;
		font-size: 32upx;
	}

	.square-box2 {
		font-weight: bold;
		font-size: 28upx;
	}

	.square-box,
	.square-box2 {
		transition: font-size 0.5s ease-in-out
	}

	/* ===== 首页响应式 ===== */
	.home-feed-wrap {
		width: 100%;
		box-sizing: border-box;
	}

	/* ===== 推荐功能（轮播下方，仿 Flutter） ===== */
	.home-feature-block {
		background: #f5f6fa;
		padding: 8px 0 4px 0;
		overflow: hidden;
	}

	.home-feature-header {
		display: flex;
		align-items: center;
		padding: 4px 12px 0 12px;
		min-height: 24px;
	}

	.home-feature-header-icon {
		color: #4285F4;
		font-size: 20px;
		margin-right: 7px;
		flex-shrink: 0;
	}

	.home-feature-header-title {
		font-size: 16px;
		font-weight: bold;
		color: #111;
		flex: 1;
		line-height: 1.4;
	}

	.home-feature-header-more {
		display: flex;
		align-items: center;
		color: #999;
		font-size: 12px;
		flex-shrink: 0;
	}

	.home-feature-header-more .cuIcon-right {
		font-size: 16px;
		margin-left: 2px;
	}

	.home-feature-scroll {
		width: 100%;
		white-space: nowrap;
		margin-top: 8px;
	}

	.home-feature-row {
		display: inline-flex;
		flex-direction: row;
		align-items: flex-start;
		padding: 0 12px 6px 39px;
	}

	.home-feature-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 68px;
		margin-right: 10px;
		flex-shrink: 0;
	}

	.home-feature-item:last-child {
		margin-right: 0;
	}

	.home-feature-icon {
		width: 49px;
		height: 49px;
		border-radius: 11px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		box-sizing: border-box;
	}

	.home-feature-icon image {
		width: 100%;
		height: 100%;
		display: block;
	}

	.home-feature-icon text {
		color: #fff;
		font-size: 21px;
		font-weight: bold;
		line-height: 1;
	}

	.home-feature-name {
		margin-top: 6px;
		font-size: 11px;
		color: rgba(0, 0, 0, 0.54);
		max-width: 68px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
		line-height: 1.3;
	}

	/* 首页滚动公告（推荐功能下方 / 发现页） */
	.home-notice-bar {
		display: flex;
		align-items: center;
		background: #fff;
		border-radius: 8px;
		padding: 8px 10px;
		margin-top: 10px;
		overflow: hidden;
		box-sizing: border-box;
	}

	.home-notice-icon {
		color: #ff9800;
		font-size: 16px;
		flex-shrink: 0;
		margin-right: 6px;
	}

	.home-notice-text {
		flex: 1;
		min-width: 0;
		margin: 0;
		background: #fff;
		color: #333;
		font-size: 13px;
		line-height: 1.4;
		white-space: nowrap;
		overflow: hidden;
	}

	/* 窄屏：公告条收紧 */
	@media screen and (max-width: 360px) {
		.home-notice-bar {
			padding: 6px 8px;
			margin-top: 8px;
		}

		.home-notice-icon {
			font-size: 14px;
			margin-right: 4px;
		}

		.home-notice-text {
			font-size: 12px;
		}
	}

	/* 平板/桌面：与信息流同宽居中 */
	@media screen and (min-width: 768px) {
		.home-notice-bar {
			max-width: 720px;
			margin-left: auto;
			margin-right: auto;
		}
	}

	@media screen and (min-width: 1024px) {
		.home-notice-bar {
			max-width: 1000px;
		}
	}

	/* 窄屏：功能图标与间距收紧 */
	@media screen and (max-width: 360px) {
		.home-feature-block {
			padding-top: 6px;
		}

		.home-feature-header {
			padding-left: 10px;
			padding-right: 10px;
		}

		.home-feature-header-title {
			font-size: 15px;
		}

		.home-feature-row {
			padding-left: 28px;
			padding-right: 10px;
		}

		.home-feature-item {
			width: 60px;
			margin-right: 6px;
		}

		.home-feature-icon {
			width: 44px;
			height: 44px;
			border-radius: 10px;
		}

		.home-feature-icon text {
			font-size: 18px;
		}

		.home-feature-name {
			max-width: 60px;
			font-size: 10px;
			margin-top: 4px;
		}
	}

	/* 平板：限宽居中，横滑区域不整屏拉伸 */
	@media screen and (min-width: 768px) {
		.home-feature-block {
			max-width: 720px;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
			padding-left: 12px;
			padding-right: 12px;
			background: transparent;
		}

		.home-feature-header {
			padding-left: 0;
			padding-right: 0;
		}

		.home-feature-row {
			padding-left: 0;
			padding-right: 0;
		}
	}

	/* 桌面：改为自动换行宫格，减少横滑；条目略放大 */
	@media screen and (min-width: 1024px) {
		.home-feature-block {
			max-width: 1000px;
		}

		.home-feature-scroll {
			white-space: normal;
		}

		.home-feature-row {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
			gap: 12px 8px;
			padding-bottom: 8px;
		}

		.home-feature-item {
			width: 76px;
			margin-right: 0;
		}

		.home-feature-icon {
			width: 52px;
			height: 52px;
		}

		.home-feature-name {
			max-width: 76px;
			font-size: 12px;
		}
	}

	/* 顶栏：首页/发现 + 搜索 + 通知在宽屏不挤成一团 */
	@media screen and (min-width: 768px) {
		.header .cu-bar .search-form {
			max-width: 280px;
			margin-left: 16px;
			margin-right: 8px;
		}

		.header .square-box,
		.header .square-box2 {
			font-size: 17px;
		}
		.header .square-box2 {
			opacity: 0.75;
		}

		/* 关注/最新/回复/最热 sticky 栏限宽居中 */
		.all-box .cu-bar.bg-white .action {
			max-width: 720px;
			margin: 0 auto;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: flex-start;
			padding: 0 12px;
		}
		.all-box .square-box {
			padding: 10px 14px;
			font-size: 16px;
		}

		/* 分类 tab 下的内容区 */
		.home-feed-wrap {
			max-width: 720px;
			margin: 0 auto;
			padding: 0 4px;
		}

		/* 文章卡片外层一并限宽居中 */
		.home-feed-wrap .dynamic,
		.home-feed-wrap .articleb,
		.all-box .articleb {
			max-width: 100%;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
		}

		/* 置顶/推荐卡片同样限宽 */
		.all-box {
			max-width: 720px;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
		}

		/* 发现页工具区与推荐列表限宽 */
		.data-box {
			max-width: 960px;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
		}

		/* 推荐榜两列更易读 */
		.top {
			display: flex;
			flex-wrap: wrap;
			max-width: 720px;
			margin: 0 auto;
			box-sizing: border-box;
			padding: 4px 10px 10px;
		}
		.top .top-box {
			width: 50%;
			box-sizing: border-box;
			padding-right: 8px;
		}

		/* 标签云限宽 */
		.tags {
			max-width: 960px;
			margin: 0 auto;
			box-sizing: border-box;
			padding: 8px 12px;
		}

		/* 活跃用户列表 */
		.userList {
			max-width: 720px;
			margin: 0 auto;
			box-sizing: border-box;
		}

		/* 加载更多触控区域 */
		.load-more {
			max-width: 720px;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
		}
	}

	@media screen and (min-width: 1024px) {
		/* 桌面：发现在多列信息流下保持单列阅读宽度，入口区可更宽 */
		.data-box {
			max-width: 1000px;
		}
		.screen-swiper {
			max-width: 1000px;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
		}
	}

	/* 窄屏：顶部首页/发现间距收紧，避免搜索框被挤没 */
	@media screen and (max-width: 375px) {
		.header .tab-wrap-index,
		.header .square-box,
		.header .square-box2 {
			font-size: 15px;
		}
		.header .search-form {
			margin-left: 6px !important;
			margin-right: 6px !important;
			min-width: 72px;
		}
		.all-box .square-box {
			padding: 8px 10px;
			font-size: 15px !important;
		}
	}
</style>