<template>
	<view :class="$store.state.AppStyle">
		<view class="header" :style="{overflow: 'hidden', paddingTop: StatusBar + 'px', backgroundColor: '#fff'}">
			<view class="cu-bar bg-white" :style="{'height': 50 + 'px'}">
				<view class="action">
					<text class="square-box" :class="squareid==0?'cur':''" @tap="setSquare(0,true)">动态</text>
					<text class="square-box" :class="squareid==1?'cur':''" @tap="setSquare(1,true)">分类</text>
					<text class="square-box" :class="squareid==2?'cur':''" @tap="setSquare(2,true)">群聊</text>
				</view>
				<view class="content text-bold" :style="[{top:StatusBar + 'px'}]">
				</view>
				<!--  #ifdef H5 || APP-PLUS -->
				<view class="action" @tap="toSearch">
					<text class="cuIcon-search"></text>
				</view>
				<!--  #endif -->
			</view>
		</view>

		<block v-if="squareid==0">
			<view :style="[{padding:NavBar+ 'px 10px 0px 0px' }]"></view>
			<view class="data-box">
				<view class="square-post">
					<view class="square-post-header">
						<view class="square-user" @tap="goUserInfo()">
							<view class="cu-avatar round" :style="userInfo.style" v-if="token!=''"></view>
							<view class="cu-avatar round" v-else>
								<text class="text-blue text-sm">登录</text>
							</view>
						</view>
						<view class="square-text" @tap="postSpace(0)">
							分享你的想法吧！
						</view>
					</view>
					<view class="square-post-btn grid col-4">
						<view class="square-post-btn-box" @tap="postSpace(0)">
							<text class="cuIcon-pic text-green"></text>图片
						</view>
						<view class="square-post-btn-box" @tap="postSpace(4)">
							<text class="cuIcon-record text-purple"></text>视频
						</view>
						<view class="square-post-btn-box" @tap="postSpace(1)">
							<text class="cuIcon-read text-blue"></text>文章
						</view>
						<view class="square-post-btn-box" @tap="postSpace(5)">
							<text class="cuIcon-cart text-red"></text>商品
						</view>
					</view>
				</view>
			</view>
			<view class="square-data-type">
				<text :class="spaceDataType==0?'cur':''" @tap="setSpaceDataType(0)">只看关注</text>
				<text :class="spaceDataType==1?'cur':''" @tap="setSpaceDataType(1)">点赞最多</text>
				<text :class="spaceDataType==2?'cur':''" @tap="setSpaceDataType(2)">实时最新</text>
			</view>
			<block v-if="spaceList.length==0">
				<block v-if="spaceLoad">
					<view class="no-data">
						<text class="cuIcon-text"></text>
						暂时没有动态哦！
						<view class="text-center margin-top-sm">
							<text class="cu-btn bg-gradual-orange radius" @tap="postSpace(0)">我要发布</text>
						</view>
					</view>
				</block>
				<block v-else>
					<view class="dataLoad" v-if="!dataLoad">
						<image src="../../static/loading.gif"></image>
					</view>
				</block>
			</block>
			<spaceItem :spaceList="spaceList"></spaceItem>
			<view class="load-more" @tap="loadMore" v-if="dataLoad&&chatList.length>0">
				<text>{{moreText}}</text>
			</view>
		</block>
		<block v-if="squareid==1">
			<view :style="[{padding:NavBar+10+ 'px 10px 0px 0px' }]"></view>
			<view class="userpost" :class="AppStyle">
				<!-- <metas :topic="metaCircleList" :swiper="swiperList" :quanzi_style="quanzi_style" :moreText="moreText" :isLoading="isLoading"
					@loadMore="metaLoadMore" /> -->
				<!-- 轮播 begin -->
				<swiper class="screen-swiper" :class="dotStyle?'square-dot':'round-dot'" :indicator-dots="true"
					:circular="true" :autoplay="true" interval="4000" duration="500">
					<swiper-item v-for="(item,index) in swiperList" :key="index" @tap="toInfo(item)">
						<view class="swiper-box">
							<image :src="item.url" mode="aspectFill" v-if="item.type=='image'"></image>
							<video :src="item.url" autoplay loop muted :show-play-btn="false" :controls="false"
								objectFit="cover" v-if="item.type=='video'"></video>
							<view class="swiper-text">
								<view class="swiper-title">
									{{item.title}}
								</view>
								<!-- <view class="swiper-intro">
										{{item.intro}}
									</view> -->
							</view>
						</view>
					</swiper-item>
				</swiper>
				<!-- 轮播 end -->
				<!-- 用户榜 -->
				<block v-if="userlist_of==1 && isLoading==1">
					<view class="tn-margin-top-sm" @tap="toUserList">
						<view class="tn-flex tn-flex-row-between tn-round tn-padding-xs tn-margin"
							style="background: #71e0b7;color: #fff;">
							<view class="justify-content-item tn-text-center tn-flex"
								style="background-color: transparent;">
								<tn-avatar-group :lists="latestUserAvatar" size="sm" gap="0.4"></tn-avatar-group>
								<text class="tn-padding-xs">共{{usercount}}人</text>
							</view>
							<view class="justify-content-item tn-text-right tn-padding-top">
								<view class="tn-text-bold">
									全部用户
								</view>
							</view>
							<view class="justify-content-item tn-text-right tn-margin-right tn-padding-top">
								<text class="tn-icon-right"></text>
							</view>
						</view>
					</view>
				</block>
				<block v-if="quanzi_style==1 && isLoading==1">
					<!-- 圈子开始 -->
					<view class="allCategory">
						<view class="no-data" v-if="metaListbb.length==0">
							<text class="cuIcon-text"></text>暂时没有数据
						</view>
						<view class="category">
							<view class="category-item" v-for="(item,index) in metaListbb" :key="index">
								<view class="category-item-title text-bold">
									{{item.name}}
									<block>
										<text class="cuIcon-right" @tap="toCategoryContents(item.name,item.mid,item.imgurl)" v-if="item.subList.length==0"></text>
									</block>
								</view>
								<view class="category-content grid " v-if="item.subList.length>0">
									<view class="container">
										<view class="ghj234">
											<block v-for="(data,i) in item.subList">
												<view class="klm098" @tap="toCategoryContents(data.name,data.mid,data.imgurl)">
													<view class="poi321">
														<view class="image-picbook" v-if="data.imgurl"
															:style="'background-image:url(' + data.imgurl + ')'"></view>
														<view class="image-picbook image-picbook-letter" v-else>{{ metaLetter(data.name) }}</view>
														<view class="tn-blogger-content__label">
															<text
																class="tn-blogger-content__label__desc">{{ data.name }}</text>
															<text class="tn-color-gray">热度：{{data.heat}}</text>
														</view>
													</view>
												</view>
											</block>
										</view>
									</view>
								</view>
								<!-- <view class="category-content grid col-2"  v-if="item.subList.length>0">
									<view class="category-box"  v-for="(data,i) in item.subList" @tap="toCategoryContents(data.name,data.mid,data.imgurl)">
										
										<view class="category-main">
											{{data.name}}
										</view>
									</view>
								</view> -->
							</view>

						</view>
					</view>
					<!-- 圈子结束 -->
				</block>
				<block v-if="quanzi_style==2 && isLoading==1">
					<view class="tn-flex tn-flex-wrap tn-margin-sm">
						<block v-for="(item, index) in metaCircleList" :key="index">
							<view class="" style="width: 100%;"
								@tap="toCategoryContents(item.name,item.mid,item.imgurl)">
								<view class="tn-blogger-content__wrap" style="background-color: rgba(255,255,255,0.6);">
									<view class="image-picbook" v-if="item.imgurl" :style="'background-image:url(' + item.imgurl + ')'">
										<view class="image-book">
										</view>
									</view>
									<view class="image-picbook image-picbook-letter" v-else>{{ metaLetter(item.name) }}</view>

									<view class="tn-blogger-content__label tn-text-justify"
										style="padding: 10px 10px 0px 10px;">
										<text class="tn-blogger-content__label__desc">{{ item.name }}</text>
									</view>

									<view class="tn-blogger-content__label tn-text-justify"
										style="padding: 0px 10px 10px 10px;">
										<text
											class="tn-text-sm tn-blogger-content__label__desc tn-color-gray">{{ item.description }}</text>
									</view>
								</view>
							</view>
						</block>
					</view>
					<view class="tn-text-center" v-show="metaCircleList.length == 0">
						<text class="text-gray">暂时还没有设置分类介绍哦~</text>
					</view>
				</block>
				<block v-if="quanzi_style==3 && isLoading==1">
					<view style="padding: 5px;"></view>
					<view class="container">
						<view class="ghj234">
							<block v-for="(item, index) in metaCircleList" :key="index">
								<view class="klm098" @tap="toCategoryContents(item.name,item.mid,item.imgurl)">
									<view class="poi321">
										<view class="image-picbook" v-if="item.imgurl"
											:style="'background-image:url(' + item.imgurl + ')'"></view>
										<view class="image-picbook image-picbook-letter" v-else>{{ metaLetter(item.name) }}</view>
										<view class="tn-blogger-content__label">
											<text class="tn-blogger-content__label__desc">{{ item.name }}</text>
											<text class="tn-color-gray">{{ item.description}}</text>
										</view>
									</view>
								</view>
							</block>
						</view>
					</view>
				</block>

			</view>
		</block>
		<block v-if="squareid==2">
			<view :style="[{padding:NavBar+ 'px 10px 0px 0px' }]"></view>
			<view class="no-data" v-if="token==''">
				<text class="cuIcon-text"></text>

				请先登录哦！
				<view class="text-center margin-top-sm">
					<text class="cu-btn bg-blue radius" @tap="goLogin()">登录</text>
					<text class="cu-btn bg-olive radius margin-left-sm" @tap="goRegister()">注册</text>
				</view>

			</view>
			<view class="cu-list menu-avatar" v-if="token!=''">
				<view class="cu-bar bg-white search">
					<view class="search-form round">
						<text class="cuIcon-search"></text>
						<input type="text" placeholder="搜索群聊" v-model="searchText"></input>
						<view class="search-close" v-if="searchText!=''" @tap="searchClose()"><text
								class="cuIcon-close"></text></view>
					</view>
				</view>
				<view class="no-data" v-if="chatList.length==0">
					<text class="cuIcon-text"></text>
					暂时没有数据
				</view>
				<block v-for="(item,index) in chatList" :key="index">
					<view class="cu-item" @tap="goChat(item)" v-if="item.name.indexOf(searchText)!=-1">
						<block v-if="item.type==1">
							<view class="cu-avatar round lg" :style="'background-image:url('+item.pic+');'"></view>
						</block>
						<block v-else>
							<view class="cu-avatar round lg" :style="'background-image:url('+item.userJson.avatar+');'">
							</view>
						</block>
						<view class="content">
							<view>
								<view class="text-cut">{{item.name}}</view>
							</view>
							<view class="text-gray text-sm flex">
								<view class="text-cut">
									<block v-if="item.lastMsg!=null">

										<block v-if="item.lastMsg.type!=4">
											<block v-if="item.lastMsg.uid==uid">
												我:
											</block>
											<block v-if="item.lastMsg.uid!=uid">
												{{item.name}}:
											</block>
											<block v-if="item.lastMsg.type==0">
												{{item.lastMsg.text}}
											</block>
											<block v-if="item.lastMsg.type==1">
												[图片]
											</block>
										</block>
										<block v-else>
											<block v-if="item.lastMsg.text=='ban'">
												<text class="text-red">[已开启全体禁言]</text>
											</block>
											<block v-else>
												<text class="text-blue">[已解除全体禁言]</text>
											</block>
										</block>
									</block>
									<block v-else>暂无消息</block>
								</view>
							</view>
						</view>
						<view class="action">
							<view class="text-grey text-xs">{{chatFormatDate(item.lastTime)}}</view>
							<block v-if="item.lastMsg!=null">
								<block v-if="item.lastMsg.uid==uid">
									<view class="cu-tag sm" style="background: none;">&nbsp</view>
								</block>
								<block v-else>
									<view class="cu-tag sm" style="background: none;" v-if="item.isNew==0">&nbsp</view>
									<view class="cu-tag round bg-red sm" v-else>{{item.unRead}}</view>
								</block>
							</block>
							<block v-else>
								<view class="cu-tag sm" style="background: none;">&nbsp</view>
							</block>
						</view>
					</view>
				</block>
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

		<!-- <view style="width: 100%; height: 130upx;"></view> -->
		<!--  #ifdef APP-PLUS -->
		<!-- <view style="height: 100upx;"></view>
		<Tabbar :current="1"></Tabbar> -->
		<!--  #endif -->
	</view>
</template>

<script>
	import waves from '@/components/xxley-waves/waves.vue';
	import metas from '@/pages/contents/metas.vue';
	// #ifdef APP-PLUS
	// import Tabbar from '@/pages/components/tabBar.vue'
	// #endif
	import {
		localStorage
	} from '../../js_sdk/mp-storage/mp-storage/index.js'
	export default {
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				NavBar: this.StatusBar + this.CustomBar,
				// AppStyle: this.$store.state.AppStyle, // Removed this line

				userInfo: null,
				token: "",
				isLoading: 0,
				toolid: 0,

				noticeSum: 0,

				squareid: 1,
				searchText: "",

				chatList: [],
				oldChatList: [],

				spaceList: [],

				isGetChat: null,

				uid: 0,
				dataLoad: false,

				page: 1,
				moreText: "加载更多",
				//

				moreText: "加载更多",
				page: 1,

				//分类数据
				type: "all",
				metaPage: 1,
				metaCircleList: [],
				metaCircleMoreTxt: "加载更多",
				postNum:0,
				metaListbb: [],
				searchText: "",
				submit: [],

				quanzi_style: 1,
				userlist_of: 0,
				userlist_all: 0,
				// 
				// sectionList: [],
				swiperList: [],
				dotStyle: false, // Added dotStyle property

				noLogin: false,

				spaceDataType: 2,
				spaceLoad: false

			}
		},
		onPullDownRefresh() {
			var that = this;
			console.log("触发下拉刷新");
			that.page = 1;
			that.setSquare(that.squareid, true);

			var timer = setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000)
		},
		onReachBottom() {
			//触底后执行的方法，比如无限加载之类的
			var that = this;
			console.log("触发触底刷新");
			if (that.isLoading == 0) {
				that.loadMore();
			}

		},
		onHide() {
			var that = this
			clearInterval(that.isGetChat);
			that.isGetChat = null
		},
		onShow() {
			var that = this;
			// 111111111111111
			if (that.page == 1) {
				that.allCache();
			}

			if (localStorage.getItem('userinfo')) {

				that.userInfo = JSON.parse(localStorage.getItem('userinfo'));
				that.userInfo.style = "background-image:url(" + that.userInfo.avatar + ");";
				that.uid = that.userInfo.uid;
			}
			if (localStorage.getItem('token')) {

				that.token = localStorage.getItem('token');
			} else {
				that.token = "";
			}
			if (localStorage.getItem('chatList')) {
				that.oldChatList = JSON.parse(localStorage.getItem('chatList'));
				// that.chatList = JSON.parse(localStorage.getItem('chatList'));
			}

			that.userStatus();
			that.unreadNum();
			that.setSquare(that.squareid, false);
			that.getSwiper();
			// 111111111111111111
			that.loadMore();
			// #ifdef APP-PLUS
			// uni.hideTabBar({
			// 	animation: false
			// })
			plus.navigator.setStatusBarStyle("dark")
			// #endif
			if (that.token != "") {
				that.getMyChat(false);
				that.isGetChat = setInterval(() => {
					that.getMyChat(false);
				}, 4000);
			}

		},
		onLoad() {
			var that = this;
			that.loadMore();

			// that.getUserList(false);
			if (that.token != "") {
				that.getMyChat(false);
				that.isGetChat = setInterval(() => {
					that.getMyChat(false);
				}, 4000);
			}
			// #ifdef APP-PLUS || MP
			that.NavBar = this.CustomBar;
			// #endif
		},
		mounted() {
			var that = this;
			that.loadMore();
			// that.getgg();
			// #ifdef APP-PLUS || MP
			that.NavBar = this.CustomBar;
			// #endif	
			that.getContinuous();
		},
		beforeDestroy() {
			var that = this;
			clearInterval(that.isGetChat);
			that.isGetChat = null
		},
		methods: {
			//公共缓存
			allCache() {
				var that = this;
				if (localStorage.getItem('spaceList')) {
					that.spaceList = JSON.parse(localStorage.getItem('spaceList'));
				}
				// 
				var meta = that.TabCur;
				if (localStorage.getItem('square_metaListbb')) {
					that.metaListbb = JSON.parse(localStorage.getItem('square_metaListbb'));
					var timer = setTimeout(function() {
						that.isLoading = 1;
						clearTimeout('timer')
					}, 300)
				}
				if (localStorage.getItem('contentsList_' + meta)) {
					that.contentsList = JSON.parse(localStorage.getItem('contentsList_' + meta));
				}
				if (localStorage.getItem('topContents')) {
					that.topContents = JSON.parse(localStorage.getItem('topContents'));
				}

				if (localStorage.getItem('metaCircleList')) {
					that.metaCircleList = JSON.parse(localStorage.getItem('metaCircleList'));
					var timer = setTimeout(function() {
						that.isLoading = 1;
						clearTimeout('timer')
					}, 300)
				}
				// 
				if (localStorage.getItem('swiperList')) {
					that.swiperList = JSON.parse(localStorage.getItem('swiperList'));
					var timer = setTimeout(function() {
						that.isLoading = 1;
						clearTimeout('timer')
					}, 300)
				}
			},
			setSquare(type, reset) {
				var that = this;
				if (reset) {
					that.page = 1;
				}
				console.log("当前分页" + that.page)
				that.squareid = type;
				clearInterval(that.isGetChat);
				that.isGetChat = null
				if (type == 0) {
					if (that.page == 1) {
						that.getSpaceList(false);
					}
				}
				if (type == 1) {
					that.moreText = "加载中...";
					that.isLoading = 1;
					that.getTopPic(false);
					that.getMetaList();
				}
				if (type == 2) {
					if (that.token != "") {
						that.getMyChat(false);
						that.isGetChat = setInterval(() => {
							that.getMyChat(false);
						}, 4000);
					}
				}

			},
			loadMore() {
				var that = this;
				that.moreText = "正在加载中...";
				that.isLoading = 1;
				if (that.squareid == 0) {
					that.getSpaceList(true);
				}
				if (that.squareid == 1) {
					that.getTopPic(true);
					that.getMetaList();
				}
				if (that.squareid == 2) {
					that.getMyChat(true);
				}
			},
			searchClose() {
				var that = this;
				that.searchText = "";
				that.page = 1;
				// that.getUserList(false);
			},
			formatDate(datetime) {
				var datetime = new Date(parseInt(datetime * 1000));
				// 获取年月日时分秒值  slice(-2)过滤掉大于10日期前面的0
				var year = datetime.getFullYear(),
					month = ("0" + (datetime.getMonth() + 1)).slice(-2),
					date = ("0" + datetime.getDate()).slice(-2),
					hour = ("0" + datetime.getHours()).slice(-2),
					minute = ("0" + datetime.getMinutes()).slice(-2);
				//second = ("0" + date.getSeconds()).slice(-2);
				// 拼接
				var result = year + "-" + month + "-" + date + " " + hour + ":" + minute;
				// 返回
				return result;
			},
			toInfo(data) {
				var that = this;
				clearInterval(that.chatLoading);
				that.chatLoading = null
				uni.navigateTo({
					url: '/pages/contents/info?cid=' + data.cid + "&title=" + data.title
				});
			},
			toPage(title, cid) {
				var that = this;
				clearInterval(that.chatLoading);
				that.chatLoading = null
				uni.navigateTo({
					url: '/pages/contents/info?cid=' + cid + "&title=" + title
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
				clearInterval(that.chatLoading);
				that.chatLoading = null
				uni.navigateTo({
					url: '/pages/contents/search'
				});
			},
			goPage(url) {
				var that = this;
				clearInterval(that.chatLoading);
				that.chatLoading = null
				uni.navigateTo({
					url: url
				});
			},

			toCategoryContents(title, id, imgurl) {
				var that = this;
				clearInterval(that.chatLoading);
				that.chatLoading = null
				var type = "meta";
				uni.navigateTo({
					url: '/pages/contents/contentlist?title=' + title + "&type=" + type + "&id=" + id +
						"&imgurl=" + imgurl
				});
			},
			metaLetter(name) {
				name = (name || '').trim();
				return name ? name.charAt(0) : '';
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
						that.isLoading = 1;
						if (res.data.code == 0 || res.data.code == 401) {
							localStorage.removeItem('userinfo');
							localStorage.removeItem('token');
							that.token = "";
							that.userinfo = null;
							that.userInfo = null;
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
			toLink(text) {
				var that = this;

				if (!localStorage.getItem('token') || localStorage.getItem('token') == "") {
					uni.showToast({
						title: "请先登录哦",
						icon: 'none'
					})
					return false;
				}
				uni.navigateTo({
					url: text
				});
			},
			toGroup() {
				// FAST_URL(sb.520771.xyz) 已移除
			},
			unreadNum() {
				var that = this;
				if (localStorage.getItem('noticeSum')) {
					that.noticeSum = Number(localStorage.getItem('noticeSum'));
				}
			},
			getContinuous() {
				// FAST_URL(sb.520771.xyz) 已移除
			},
			getTopPic(isPage) {
				var that = this;
				var data = {
					"isrecommend": "1",
				}
				var page = that.metaPage;
				if (isPage) {
					page++;
				}
				that.$Net.request({
					url: that.$API.getMetasList(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 20,
						"order": "order",
						"page": page,
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
								var Topic = list;
								if (isPage) {
									that.metaPage++;

									that.metaCircleList = that.metaCircleList.concat(Topic);
								} else {
									that.metaCircleList = Topic;
								}
							} else {
								that.metaCircleMoreTxt = "没有更多数据了";
							}

						}
					},

					fail: function(res) {

						that.isLoading = 0;
						that.metaCircleMoreTxt = "加载更多";
					}
				})
			},
			metaLoadMore() {
				if (this.squareid == 1) {
					// console.log('metaLoadMore');
					this.metaCircleMoreTxt = "加载中...";
				}

			},

			getSwiper() {
				var that = this;
				var data = {
					"type": "post",
					"isswiper": 1
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
						"limit": 8,
						"page": 1,
						"order": "modified",
						"token": token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {

						if (res.data.code == 1) {
							that.noLogin = false;
							var list = res.data.data;
							var swiper = [];
							if (list.length > 0) {
								for (var i in list) {
									if (list[i].images.length > 0) {
										var arr = {
											cid: list[i].cid,
											type: 'image',
											url: list[i].images[0],
											title: list[i].title,
											intro: that.subText(list[i].text, 20),
										}
										swiper.push(arr);
									}

								}
								that.swiperList = swiper;

							} else {
								that.swiperList = [];
							}
							localStorage.setItem('swiperList', JSON.stringify(that.swiperList));
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

			getMetaList() {
				var that = this;
				var data = {
					"isrecommend": "1",
					"type": "category"
				}
				that.$Net.request({
					url: that.$API.getMetasList(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 100,
						"page": 1,
						"order": "order"
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						// console.log(JSON.stringify(res))
						if (res.data.code == 1) {
							var list = res.data.data;
							if (list.length > 0) {
								var parentList = [];
								for (var i in list) {
									if (list[i].parent == 0) {
										list[i].show = false;
										list[i].active = 0;
										parentList.push(list[i]);
									}
								}
								for (var o in parentList) {
									var subList = [];
									for (var s in list) {
										if (list[s].parent == parentList[o].mid) {
											list[s].active = 0;
											subList.push(list[s]);
										}
									}
									parentList[o].subList = subList;
								}
								that.metaListbb = parentList;


								localStorage.setItem('square_metaListbb', JSON.stringify(that.metaListbb));
							}
						}
						var timer = setTimeout(function() {
							that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
					},
					fail: function(res) {
						uni.showToast({
							title: "网络开小差了哦",
							icon: 'none'
						})
						var timer = setTimeout(function() {
							that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
					}
				})
			},
			replaceSpecialChar(text) {
				text = text.replace(/&quot;/g, '"');
				text = text.replace(/&amp;/g, '&');
				text = text.replace(/&lt;/g, '<');
				text = text.replace(/&gt;/g, '>');
				text = text.replace(/&nbsp;/g, ' ');
				return text;
			},

			//群聊(性能考虑，只加载前30条)
			getMyChat(isPage) {
				var that = this;
				var page = that.page;
				if (isPage) {
					page++;
				}
				if (that.token == "") {
					uni.showToast({
						title: "请先登录",
						icon: 'none',
						duration: 1000,
						position: 'bottom',
					});
					return false
				}
				that.$Net.request({
					url: that.$API.allChat(),
					data: {
						"token": that.token,
						"limit": 30,
						"page": page,
						"order": "lastTime"
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						that.isLoading = 1;
						// that.isLoad = 0;
						if (res.data.code == 1) {
							var list = res.data.data;
							if (list.length > 0) {
								var chatList = [];
								for (var i in list) {
									var arr = list[i];
									arr.isNew = 0;
									arr.unRead = 0;
									chatList.push(arr);
								}
								if (isPage) {
									that.page++;
									that.chatList = that.chatList.concat(chatList);
								} else {
									var oldChatList = [];
									if (that.oldChatList != null) {
										oldChatList = that.oldChatList;
									}
									if (oldChatList.length > 0) {

										if (!that.arraysEqual(oldChatList, chatList)) {
											// console.log("开始对比")
											for (var c in chatList) {
												for (var d in oldChatList) {
													if (oldChatList[d].id == chatList[c].id) {
														if (oldChatList[d].lastTime < chatList[c].lastTime) {
															console.log("赋值完成")
															chatList[c].isNew = 1;

															var unRead = chatList[c].msgNum - oldChatList[d]
																.msgNum;
															if (unRead <= 0) {
																unRead = 0;
															}
															chatList[c].unRead = unRead;
														}
													}

												}
											}
											that.oldChatList = chatList;
											that.chatList = chatList;
											localStorage.setItem('AllchatList', JSON.stringify(chatList));
										}


									} else {
										that.oldChatList = chatList;
										that.chatList = chatList;
										localStorage.setItem('AllchatList', JSON.stringify(chatList));
									}
								}
							} else {
								// that.moreText="没有更多消息了";
							}

						}
					},
					fail: function(res) {
						that.isLoading = 1;
						// that.isLoad = 0;
						// that.moreText="加载更多";
					}
				})
			},
			arraysEqual(a, b) {
				if (a === b) return true;
				if (a == null || b == null) return false;
				if (a.length != b.length) return false;
				for (var c in a) {
					for (var d in b) {
						if (b[d].id == a[c].id) {
							if (b[d].lastTime != a[c].lastTime) {
								return false;
							}
						}

					}
				}
			},
			chatFormatDate(datetime) {
				var datetime = new Date(parseInt(datetime * 1000));
				// 获取年月日时分秒值  slice(-2)过滤掉大于10日期前面的0
				var year = datetime.getFullYear();
				var month = ("0" + (datetime.getMonth() + 1)).slice(-2);
				var date = ("0" + datetime.getDate()).slice(-2);
				var hour = ("0" + datetime.getHours()).slice(-2);
				var minute = ("0" + datetime.getMinutes()).slice(-2);
				var time = year + "" + month + "" + date;

				var result = hour + ":" + minute;
				var curDate = new Date();
				var curYear = curDate.getFullYear(); //获取完整的年份(4位)
				var curMonth = ("0" + (curDate.getMonth() + 1)).slice(-2);
				var curDay = ("0" + curDate.getDate()).slice(-2); //获取当前日(1-31)
				var curTime = curYear + "" + curMonth + "" + curDay;
				if (year == curYear) {
					if (year == curYear) {
						if (date == curDay) {
							result = hour + ":" + minute;
						} else {
							result = month + "-" + date;
						}
					} else {
						result = month + "-" + date;
					}
				} else {
					result = month + "-" + date;
				}
				return result;
			},
			goChat(data) {
				var that = this;
				var chatid = data.id;
				clearInterval(that.chatLoading);
				that.chatLoading = null
				//去除未读标志
				var chatlist = that.chatList;
				for (var i in chatlist) {
					if (chatlist[i].id == chatid) {
						chatlist[i].isNew = 0;
						chatlist[i].unRead = 0;
					}
				}
				that.chatList = chatlist;
				that.oldChatList = that.chatList;
				localStorage.setItem('AllchatList', JSON.stringify(that.chatList));
				//结束
				if (data.type == 0) {
					var name = data.userJson.name;
					var uid = data.userJson.uid;

					uni.navigateTo({
						url: '/pages/chat/chat?uid=' + uid + "&name=" + name + "&chatid=" + chatid + "&type=0"
					});
				}
				if (data.type == 1) {
					var name = data.name;

					uni.navigateTo({
						url: '/pages/chat/chat?&name=' + name + '&chatid=' + chatid + '&type=1'
					});
				}

			},
			postSpace(type) {
				var that = this;
				if (type == 1) {
					uni.navigateTo({
						url: '/pages/edit/articlePost'
					});
				} else if (type == 5) {
					uni.navigateTo({
						url: '/pages/edit/addshop'
					});
				} else {
					uni.navigateTo({
						url: '/pages/space/post?type=' + type
					});
				}


			},
			setSpaceDataType(type) {
				var that = this;
				that.spaceDataType = type;
				that.spaceLoad = false;
				that.page = 1;
				that.spaceList = [];
				that.getSpaceList(false);
			},
			getSpaceList(isPage) {
				var that = this;
				var page = that.page;
				if (isPage) {
					page++;
				}
				var data = {
					"status": 1
				}
				var token = "";
				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;

				}
				var spaceDataType = that.spaceDataType;
				var url = that.$API.followSpace();
				var order = "created";
				if (spaceDataType > 0) {
					url = that.$API.spaceList();
				}
				if (spaceDataType == 1) {
					order = "likes";
				}
				that.$Net.request({
					url: url,
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 10,
						"page": page,
						"order": order,
						"token": token
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						that.spaceLoad = true;
						that.isLoading = 1;
						// that.isLoad = 0;
						that.moreText = "加载更多";
						if (!isPage) {
							that.dataLoad = true;
						}
						if (res.data.code == 1) {
							that.noLogin = false;
							var list = res.data.data;
							var spaceList = [];
							for (var i in list) {
								if (list[i].type == 0) {
									if (list[i].pic) {
										var pic = list[i].pic;
										list[i].picList = pic.split("||");
									} else {
										list[i].picList = [];
									}

								}
								if (list[i].type == 2) {
									if (list[i].forwardJson.pic) {
										var pic = list[i].forwardJson.pic;
										list[i].forwardJson.picList = pic.split("||");
									} else {
										list[i].forwardJson.picList = [];
									}

								}
							}
							spaceList = list;
							if (list.length > 0) {
								if (isPage) {
									that.page++;
									that.spaceList = that.spaceList.concat(spaceList);
								} else {
									that.spaceList = spaceList;
								}
								localStorage.setItem('spaceList', JSON.stringify(spaceList));
							} else {
								that.moreText = "没有更多动态了";
							}

						} else {
							if (url != that.$API.followSpace()) {
								if (res.data.msg == "用户未登录或Token验证失败") {
									that.noLogin = true;
								}
							}

						}
					},
					fail: function(res) {
						that.spaceLoad = true;
						that.isLoading = 1;
						that.moreText = "加载更多";
						// that.isLoad = 0;
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
				uni.switchTab({
					url: '/pages/home/user'
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
			goLogin() {
				uni.navigateTo({
					url: '/pages/user/login'
				});
			},
		},
		// #ifdef APP-PLUS
		components: {
			waves,
			// Tabbar,
			metas
		},

		// #endif

		// #ifdef H5 || MP
		components: {
			waves,
			metas
		},

		// #endif

	}
</script>

<style scoped>
	.margin-top-sm {
		/* margin-top: 0 ; */
		/* margin-bottom: 10px; */
	}

	.image-book {
		padding: 150rpx 0rpx;
		font-size: 16rpx;
		font-weight: 300;
		position: relative;
	}

	.image-picbook {
		background-size: cover;
		background-repeat: no-repeat;
		background-position: top;
		border-radius: 15rpx 15rpx 0 0;
	}

	.image-picbook-letter {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #3cc9a4, #2b8ce0);
		color: #fff;
		font-size: 22rpx;
		font-weight: 600;
		line-height: 1;
		min-height: 80rpx;
		border-radius: 15rpx 15rpx 0 0;
	}

	.tn-blogger-content__wrap {
		box-shadow: 0px 0px 25px 0px rgba(0, 0, 0, 0.07);
		border-radius: 10px;
		margin: 7px;
	}

	.data-box {
		background: #f6f6f6;
	}

	.tn-flex {
		margin: 10px;
	}

	/* 为class属性添加偏僻词 */

	.container {
		margin-left: 14px;
		padding: 0px;
		border-radius: 10px;
	}

	/* 用偏僻词替换class属性 */
	.ghj234 {
		display: flex;
		flex-wrap: wrap;
	}

	.ghj234 .klm098 {
		width: 46%;
		box-sizing: border-box;
		padding: 10px;
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 0px 5px 5px rgb(207 207 207 / 20%);
		margin-bottom: 2px;
		margin-right: 8px;
	}



	.ghj234 .klm098 .poi321 {
		display: flex;
		align-items: center;
	}

	.ghj234 .klm098 .poi321 .image-picbook {
		width: 50px;
		height: 50px;
		min-width: 50px;
		min-height: 50px;
		flex-shrink: 0;
		background-size: cover;
		border-radius: 50%;
		margin-right: 10px;
		box-sizing: border-box;
	}

	.ghj234 .klm098 .poi321 .tn-blogger-content__label {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.ghj234 .klm098 .poi321 .tn-blogger-content__label .tn-blogger-content__label__desc {
		font-size: 15px;
		font-weight: normal;
		margin-bottom: 5px;
	}

	.ghj234 .klm098 .poi321 .tn-blogger-content__label .tn-color-gray {
		font-size: 10px;
	}

	/* 避免描述过长排版会乱 */
	.ghj234 .klm098 .poi321 .tn-color-gray {
		white-space: nowrap;
		/* 不换行 */
		overflow: hidden;
		/* 超出隐藏 */
		text-overflow: ellipsis;
		/* 显示省略号 */
		display: inline-block;
		/* 显示为行内块元素 */
		max-width: 8em;
	}

	/* ===== 社区页响应式 ===== */
	@media screen and (min-width: 768px) {
		/* 分类 tab 整体限宽居中 */
		.userpost {
			max-width: 1000px;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
		}

		/* 顶部 动态/分类/群聊 tab 组 */
		.header .cu-bar>.action:first-child {
			flex: 1;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			padding-left: 8px;
		}
		.header .square-box {
			padding: 10px 16px;
			font-size: 17px;
		}
		.header .cu-bar>.action:last-child {
			margin-right: 16px;
		}
		.header .cu-bar>.action:last-child .cuIcon-search {
			font-size: 20px;
		}

		/* 动态信息流 / 群聊列表限宽居中 */
		.data-box,
		.cu-list.menu-avatar,
		.square-list {
			max-width: 720px;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
		}

		/* 分类筛选条 */
		.square-data-type {
			max-width: 720px;
			margin: 0 auto;
			box-sizing: border-box;
			text-align: right;
		}

		/* 发帖卡片 */
		.square-post {
			max-width: 720px;
			margin: 0 auto;
			box-sizing: border-box;
		}

		/* 圈子分类：平板 3 列 */
		.ghj234 {
			justify-content: flex-start;
		}
		.ghj234 .klm098 {
			width: calc(33.333% - 8px);
			margin-right: 8px;
			box-sizing: border-box;
		}
		.ghj234 .klm098:nth-child(3n) {
			margin-right: 0;
		}

		/* 圈子风格2：双列卡片（H5 下 view 会编译成 uni-view） */
		.tn-flex.tn-flex-wrap {
			display: flex;
			flex-wrap: wrap;
			max-width: 960px;
			margin: 10px auto !important;
			box-sizing: border-box;
		}
		.tn-flex.tn-flex-wrap>uni-view,
		.tn-flex.tn-flex-wrap>view {
			width: 50% !important;
			box-sizing: border-box;
		}
		.tn-flex.tn-flex-wrap .tn-blogger-content__wrap {
			margin: 7px;
			box-sizing: border-box;
		}

		/* 群聊搜索条限宽 */
		.cu-bar.bg-white.search {
			max-width: 720px;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
		}

		/* 空态/加载更多 */
		.no-data,
		.load-more {
			max-width: 720px;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
		}
	}

	@media screen and (min-width: 1024px) {
		/* 桌面：分类卡片 4 列 */
		.ghj234 .klm098 {
			width: calc(25% - 8px);
			margin-right: 8px;
		}
		.ghj234 .klm098:nth-child(3n) {
			margin-right: 8px;
		}
		.ghj234 .klm098:nth-child(4n) {
			margin-right: 0;
		}

		/* 桌面：分类风格2 仍为双列，但卡片图更高一点更舒展 */
		.image-book {
			padding: 160rpx 0rpx;
		}

		/* 轮播限宽限高 */
		.screen-swiper {
			max-width: 960px;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
			max-height: 400px;
			overflow: hidden;
		}
		.screen-swiper .swiper-box {
			max-height: 400px;
			overflow: hidden;
		}
	}

	/* 窄屏：分类卡片单列更稳 */
	@media screen and (max-width: 360px) {
		.ghj234 .klm098 {
			width: 100%;
			margin-right: 0;
		}
		.header .square-box {
			padding: 8px 10px;
			font-size: 15px;
		}
		.tn-flex.tn-flex-wrap>uni-view,
		.tn-flex.tn-flex-wrap>view {
			width: 100% !important;
		}
	}
</style>