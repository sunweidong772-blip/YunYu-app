<template>
	<view class="userpost userIndex" :class="$store.state.AppStyle">
		<view class="header" :style="[{height:CustomBar + 'px'}]" :class="scrollTop>40?'goScroll':''">
			<view class="cu-bar" :style="{'height': CustomBar + 'px','padding-top':StatusBar + 'px'}">
				<view class="action" @tap="back">
					<text class="cuIcon-back"></text>
				</view>
				<view class="content text-bold" :style="[{top:StatusBar + 'px'}]">
					<block v-if="scrollTop>40">
						{{title || "未知版块"}}
					</block>
				</view>
				<!--  #ifdef H5 || APP-PLUS -->
				<view class="action" @tap="toSearch">
					<text class="cuIcon-search"></text>
				</view>
				<!--  #endif -->
			</view>
		</view>
		<view class="all-box" style="margin-top:-10upx">
			<view class="section-info" :style="'padding-top:'+NavBar+'px;'">
				<view class="section-info-bg">
					<image :src="imgurl" mode="aspectFill" v-if="imgurl&&imgurl!=''"></image>
					<image src="/static/forum-bg.jpg" mode="aspectFill" v-else></image>
				</view>
				<view class="section-info-main">
					<view class="section-info-content">
						<view class="section-info-full">
							<view class="section-info-ico">
								<!-- <image src="../../static/h5/owo/img/paopao/E985B7_2x.png"></image> -->
								<image :src="imgurl" mode="aspectFill" v-if="imgurl&&imgurl!=''"></image>
								<view class="section-ico-no" v-else>
									<text class="cuIcon-discoverfill"></text>
								</view>
							</view>
							<view class="section-info-intro">
								<view class="section-info-title">
									{{title || "未知版块"}}
								</view>
								<view class="section-info-value">
									<text>热度 {{heat}}</text>
								</view>
								<view class="section-info-value">
									<text>帖子 {{postNum}}</text>
									<text>今日签到 {{clockNum}}</text>
								</view>
								
							</view>
						</view>
						<view class="section-info-moderator grid col-2">
							<view class="section-info-moderator" @tap="goModerators(id)">
								<text class="moderator-btn">版主
								<text class="text-blue" >{{moderators.length}}</text>人
								</text>
								<!-- <view class="cu-avatar-group">
								    <view class="cu-avatar radius bg-red">
								        <text class="cuIcon-people"></text>
								    </view>
								    <view class="cu-avatar radius bg-red">
								        <text class="cuIcon-people"></text>
								    </view>
								</view> -->
							</view>
							<view class="section-info-clock">
								<block v-if="isFollow==0">
									<view class="cu-btn bg-blue" @tap="sectionFollow(1)"><text class="cuIcon-add margin-right-xs"></text>关注</view>
								</block>
								<block v-else>
									<view class="cu-btn bg-blue" v-if="isClock==0" @tap="sectionClock()">签到</view>
									<view class="cu-btn bg-blue" v-else>已签到</view>
								</block>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="forum-list">
			<view class="forum-list-type">
				<text @tap="getOrder('replyTime')" :class="order=='replyTime'?'act':''">全部</text>
				<text @tap="getOrder('recommend')" :class="order=='recommend'?'act':''">精华</text>
				<text @tap="getOrder('views')" :class="order=='views'?'act':''">热门</text>
				<text @tap="getOrder('created')" :class="order=='created'?'act':''">最新</text>
			
			</view>
			<view class="forum-list-top">
				<view class="forum-top-box" v-for="(item,index) in topcontentsList" @tap="toInfo(item)" :key="index">
					<view class="forum-top-i">
						<text class="text-red">置顶</text>
						<!-- <text class="hot-top" style="background-color: #ffa73a;">置顶</text> -->
					</view>
					<view class="forum-top-text">
						{{item.title}}
					</view>
				</view>
			</view>
			<view class="forum-list-main">
				<view class="no-data" v-if="contentsList.length==0">
					<text class="cuIcon-text"></text>暂时没有数据
				</view>
				<block v-for="(item,index) in contentsList" :key="index" v-if="dataLoad">
					<articleItem :item="item" :permission="false"></articleItem>
				</block>
				<view class="load-more" @tap="loadMore" v-if="dataLoad">
					<text>{{moreText}}</text>
				</view>
				
			    
			</view>
			
		</view>
		
		<view class="forum-post-btn" @tap="toLink('../edit/articleNew')">
			<text class="cuIcon-add"></text>
		</view>
		<!--加载遮罩-->
		<view class="loading" v-if="isLoading==0">
			<view class="loading-main">
				<image src="../../static/loading.gif"></image>
			</view>
		</view>
		<!--加载遮罩结束-->
	</view>

</template>

<script>
	import { renderList } from "vue";
import {
		localStorage
	} from '../../js_sdk/mp-storage/mp-storage/index.js'
	import {
		data
	} from '../../static/app-plus/owo/OwO.js';
	export default {
		data() {
			return {
				isHideNav: true,
				isShowNav: false,
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				NavBar: this.StatusBar + this.CustomBar,
				AppStyle: this.$store.state.AppStyle,
				title: "",
				type: "",
				id: 0,
				postNum:0,
				heat:0,
				imgurl: "",
				// Topic: [],
				recommendList: [],
				contentsList: [],
				topcontentsList: [],
				
				page: 1,
				moreText: "加载更多",
				metaImg: "",
				dataLoad: false,

				isLoad: 0,
				scrollTop: 0,

				metaList: [{
					mid: 0,
					name: "全部",
					parent: 0,
				}],
				order: "replyTime",
				TabCur: 0,
				scrollLeft: 0,
				isLoading: 0,
				myPurview:0,
				moderators:[],
				isFollow:0,
				isClock:0,
				clockNum:0,
			}
		},
		onPageScroll(e) {
			var that = this;
			that.scrollTop = e.scrollTop;
		},
		onPullDownRefresh() {
			var that = this;
			// that.getfenlei();
			that.getSectionInfo();
		},
		onReachBottom() {
			//触底后执行的方法，比如无限加载之类的
			var that = this;
			if (that.isLoad == 0) {
				that.loadMore();
			}

		},
		onShow() {
			// var that = this;
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarStyle("dark")
			// #endif

		},
		onLoad(res) {
			var that = this;
			// #ifdef APP-PLUS || MP
			that.NavBar = that.CustomBar;
			// #endif
			that.title = res.title;
			that.type = res.type;
			that.imgurl = res.imgurl;
			//user根据用户查询 meta根据分类和标签查询，all显示分类查询全部，search根据搜索关键词查询
			that.id = res.id;
			if (res.type != "") {
				if (that.type == "meta") {
					that.getMetaContents(false, that.id);
					that.getTopMetaContents(false, that.id);
					that.getMetaList();
					// that.getTopPic(false, that.id);
				} else if (that.type == "top") {
					that.getContentsList(false, that.type, that.id);

				} else {
					that.getContentsList(false, that.type, that.id);
				}
			}
			if (res.type == "all") {
				that.getMetaList();
			}
			// that.getfenlei();
			that.getSectionInfo();
			that.userPurview();
		},
		methods: {
			// getfenlei() {
			// 	var that = this;
			// 	var pages = getCurrentPages();
			// 	var prevPage = pages[pages.length - 1];
			// 	var id = prevPage.options.id;
			// 	uni.request({
			// 		url: that.$API.SMfenlei(),
			// 		data: {
			// 			id: that.id
			// 		},
			// 		method: 'GET',
			// 		dataType: "json",
			// 		success(res) {
			// 			that.fenlei = res.data.count;
			// 		},
			// 		fail(error) {
			// 			console.log(error);
			// 		}
			// 	})
			// },
			allCache() {
				var that = this;
				var meta = that.TabCur;

			},
			tabSelect(e) {
				var that = this;
				that.TabCur = e.currentTarget.dataset.id;
				that.id = e.currentTarget.dataset.id;
				that.page = 1;
				// that.dataLoad = false;
				that.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
				if (localStorage.getItem('metaList')) {
					that.metaList = JSON.parse(localStorage.getItem('metaList'));
				}
				// if (localStorage.getItem('Topic')) {
				// 	that.Topic = JSON.parse(localStorage.getItem('Topic'));
				// }
				if (localStorage.getItem('recommendList')) {
					that.recommendList = JSON.parse(localStorage.getItem('recommendList'));
				}
				if (that.TabCur == 0) {
					that.getContentsList(false, "all", 0);
				} else {
					that.getMetaContents(false, that.TabCur);
				}
			},
			topSelect(e) {
				var that = this;
				that.order = e.currentTarget.dataset.order;
				that.page = 1;
				that.getMetaContents(false, that.id);
				that.getTopMetaContents(false, that.id);
			},
			back() {
				uni.navigateBack({
					delta: 1
				});
			},
			loadMore() {
				var that = this;
				that.moreText = "加载中...";
				that.isLoad = 1;
				if (that.type == "meta") {
					that.getMetaContents(true, that.id);
					that.getTopMetaContents(true, that.id);
				} else if (that.type == "all") {
					if (that.id == 0) {
						that.getContentsList(true, that.type, that.id);
					} else {
						that.getMetaContents(true, that.id);
						that.getTopMetaContents(true, that.id);
					}
				} else if (that.type == "top") {
					that.getContentsList(true, that.type, that.id);

				} else {
					that.getContentsList(true, that.type, that.id);
				}
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
						"limit": 40,
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
									parent: 0
								}];
								that.metaList = meta.concat(list);
								// console.log(that.metaList)
							} else {
								that.metaList = [];
							}
							localStorage.setItem('metaList', JSON.stringify(that.metaList));
						}
						var timer = setTimeout(function() {
							that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
					},
					fail: function(res) {
						var timer = setTimeout(function() {
							that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
					}
				})
			},
			goModerators(id){
				var that = this;
				uni.navigateTo({
				    url: '/pages/contents/moderators?id='+id
				});
			},
			getSectionInfo(){
				var that = this;
				var token = "";
				if(localStorage.getItem('userinfo')){
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token=userInfo.token;
				}
				that.$Net.request({
					
					url: that.$API.sectionInfo(),
					data:{
						"id":that.id,
						"token":token
					},
					header:{
						'Content-Type':'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						// console.log(res.data.data)
						if(res.data.code==1){
							that.name = res.data.data.name;
							that.pic = res.data.data.pic;
							that.bg = res.data.data.bg;
							that.slug = res.data.data.slug;
							that.text = res.data.data.text;
							that.restrict = res.data.data.restrictKey;
							that.moderators = res.data.data.moderators;
							that.postNum =  res.data.data.postNum;
							that.heat = res.data.data.heat || 0;
							that.clockNum =  res.data.data.clockNum;
							that.isFollow = res.data.data.isFollow;
							that.isClock = res.data.data.isClock;
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
			sectionFollow(type){
				var that = this;
				uni.showLoading({
					title: "加载中"
				});
				var token = "";
				if(localStorage.getItem('userinfo')){
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token=userInfo.token;
				}
				var data = {
					"sectionId":that.id,
					"token":token,
					"type":type
				}
				that.$Net.request({
					url: that.$API.sectionFollow(),
					data:data,
					header:{
						'Content-Type':'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						setTimeout(function () {
							uni.hideLoading();
						}, 1000);
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						})
						if(res.data.code==1){
							that.getSectionInfo();
						}
						
					},
					fail: function(res) {
						setTimeout(function () {
							uni.hideLoading();
						}, 1000);
						uni.showToast({
							title: "网络开小差了哦",
							icon: 'none'
						})
					}
				})
			},
			sectionClock(){
				var that = this;
				uni.showLoading({
					title: "加载中"
				});
				var token = "";
				if(localStorage.getItem('userinfo')){
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token=userInfo.token;
				}
				var data = {
					"sectionId":that.id,
					"token":token
				}
				that.$Net.request({
					url: that.$API.sectionClock(),
					data:data,
					header:{
						'Content-Type':'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						setTimeout(function () {
							uni.hideLoading();
						}, 1000);
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						})
						if(res.data.code==1){
							that.getSectionInfo();
						}
						
					},
					fail: function(res) {
						setTimeout(function () {
							uni.hideLoading();
						}, 1000);
						uni.showToast({
							title: "网络开小差了哦",
							icon: 'none'
						})
					}
				})
			},
			userPurview(){
				var that = this;
				var uid = 0;
				if(localStorage.getItem('userinfo')){
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					uid=userInfo.uid;
				}
				var data = {
					"uid":uid,
				}
				that.$Net.request({
					url: that.$API.userPurview(),
					data:data,
					header:{
						'Content-Type':'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if(res.data.code==1){
							var list = res.data.data;
							if(list.length>0){
								for(var i in list){
									if(list[i].sectionId==that.id){
										that.myPurview = list[i].purview;
										console.log(that.myPurview)
									}
								}
								
							}
							// if(localStorage.getItem('userinfo')){
							// 	var myInfo = JSON.parse(localStorage.getItem('userinfo'));
							// 	if(myInfo.group=='administrator'||myInfo.group=='editor'){
							// 		that.myPurview = 5;
							// 	}
							// }
						}
					},
					fail: function(res) {
						
					}
				})
				
			},
			
			// getTopPic() {
			// 	var that = this;
			// 	var data = {
			// 		"isrecommend": "1"
			// 	}
			// 	that.$Net.request({
			// 		url: that.$API.getMetasList(),
			// 		data: {
			// 			"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
			// 			"limit": 4,
			// 			"page": 1,
			// 		},
			// 		header: {
			// 			'Content-Type': 'application/x-www-form-urlencoded'
			// 		},
			// 		method: "get",
			// 		dataType: 'json',
			// 		success: function(res) {
			// 			if (res.data.code == 1) {
			// 				var list = res.data.data;
			// 				if (list.length > 0) {
			// 					that.Topic = list;

			// 				} else {
			// 					that.Topic = [];
			// 				}
			// 				localStorage.setItem('Topic', JSON.stringify(that.Topic));
			// 			}
			// 			var timer = setTimeout(function() {
			// 				that.isLoading = 1;
			// 				clearTimeout('timer')
			// 			}, 300)
			// 		},
			// 		fail: function(res) {
			// 			var timer = setTimeout(function() {
			// 				that.isLoading = 1;
			// 				clearTimeout('timer')
			// 			}, 300)
			// 		}
			// 	})
			// },
			getRecommend(isPage,meta) {
				var that = this;
				var data = {
					"mid": meta,
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
						"order": "modified",
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
							// console.log(JSON.stringify(that.recommendList))
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
			// getContentsList(isPage, type, id) {
			// 	var that = this;
			// 	var info = {
			// 		"type": "post"
			// 	}
			// 	var order = "created";
			// 	if (type == "user") {
			// 		info = {
			// 			"type": "post",
			// 			"authorId": that.id
			// 		}
			// 	}
			// 	order = that.order
			// 	var page = that.page;
			// 	if (isPage) {
			// 		page++;
			// 	} else {
			// 		that.contentsList = [];
			// 	}
			// 	var data = {
			// 		"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(info)),
			// 		"limit": 5,
			// 		"istop": 1,
			// 		"page": page,
			// 		"order": order
			// 	};
			// 	that.$Net.request({
			// 		url: that.$API.getContentsList(),
			// 		data: data,
			// 		header: {
			// 			'Content-Type': 'application/x-www-form-urlencoded'
			// 		},
			// 		method: "get",
			// 		dataType: 'json',
			// 		success: function(res) {
			// 			//console.log(JSON.stringify(res))
			// 			that.moreText = "加载更多";
			// 			that.isLoad = 0;
			// 			if (!isPage) {
			// 				that.dataLoad = true;
			// 			}
			// 			if (res.data.code == 1) {
			// 				var list = res.data.data;
			// 				if (list.length > 0) {
			// 					var num = res.data.data.length;
			// 					var rand = Math.floor(Math.random() * num);
			// 					var pushAdsInfo = null;
			// 					// #ifdef APP-PLUS || H5
			// 					if (localStorage.getItem('pushAds')) {
			// 						var pushAds = JSON.parse(localStorage.getItem('pushAds'));
			// 						var adsNum = pushAds.length;
			// 						if (adsNum > 0) {
			// 							var adsRand = Math.floor(Math.random() * adsNum);
			// 							pushAdsInfo = pushAds[adsRand];
			// 							pushAdsInfo.isAds = 1;
			// 						}
			// 					}
			// 					// #endif
			// 					var contentsList = [];
			// 					//将自定义字段获取并添加到数据
			// 					var curFields = that.$API.GetFields();
			// 					for (var i in list) {
			// 						var fields = list[i].fields;
			// 						if (fields.length > 0) {
			// 							for (var j in fields) {
			// 								if (curFields.indexOf(fields[j].name) != -1) {
			// 									list[i][fields[j].name] = fields[j].strValue;
			// 								}
			// 							}
			// 						}
			// 						contentsList.push(list[i]);
			// 						// #ifdef APP-PLUS || H5
			// 						var isAds = Math.round(Math.random());
			// 						if (isAds == 1) {
			// 							if (i == rand && pushAdsInfo != null) {
			// 								contentsList.push(pushAdsInfo);
			// 							}
			// 						}

			// 						// #endif
			// 					}
			// 					if (isPage) {
			// 						that.page++;
			// 						that.contentsList = that.contentsList.concat(contentsList);
			// 					} else {
			// 						that.contentsList = contentsList;
			// 					}
			// 				} else {
			// 					that.moreText = "没有更多了~";
			// 				}
			// 			}
			// 			var timer = setTimeout(function() {
			// 				that.isLoading = 1;
			// 				clearTimeout('timer')
			// 			}, 300)
			// 		},
			// 		fail: function(res) {
			// 			that.moreText = "加载更多";
			// 			that.isLoad = 0;
			// 			uni.showToast({
			// 				title: "网络不太好哦~",
			// 				icon: 'none'
			// 			})
			// 			var timer = setTimeout(function() {
			// 				that.isLoading = 1;
			// 				clearTimeout('timer')
			// 			}, 300)
			// 		}
			// 	})
			// },
			getOrder(order) {
				var that = this;
				that.order = order;
				that.page = 1;
				that.contentsList = [];
				that.dataLoad = false;
				that.getMetaContents(false,that.id);
			},
			getMetaContents(isPage, meta) {
				var that = this;
				var data = {
					"type": "post",
					"mid": meta,
					"istop": 0
				}
				var order = "replyTime DESC";
				if (that.order == "recommend") {
					data.isrecommend = 1;
					order = "created DESC";
				} else if (that.order == "views") {
					order = "views DESC";
				} else if (that.order == "created") {
					order = "created DESC";
				} else if (that.order == "replyTime") {
					order = "replyTime DESC";
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
					url: that.$API.getContentsList(),
					data: {
						"searchParams": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit": 5,
						"page": page,
						"order": order,
						"token": token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
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
								localStorage.setItem('contentsList_' + meta, JSON.stringify(that.contentsList));
							} else {
								that.moreText = "没有更多了~";
							}
						}
						var timer = setTimeout(function() {
							that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
					},
					fail: function(res) {
						uni.showToast({
							title: "网络不太好哦~",
							icon: 'none'
						})
						var timer = setTimeout(function() {
							that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
						that.moreText = "加载更多";
						that.isLoad = 0;
					}
				})
			},
			getTopMetaContents(isPage, meta) {
				var that = this;
				var data = {
					"mid": meta,
					"istop": 2,
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
						"order": "commentsNum"
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
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
									console.log(JSON.stringify(contentsList))
								}
								if (isPage) {
									that.page++;
									that.topcontentsList = that.topcontentsList.concat(contentsList);
								} else {
									that.topcontentsList = contentsList;
								}
								localStorage.setItem('topcontentsList_' + meta, JSON.stringify(that
									.topcontentsList));
							} else {
								that.moreText = "没有更多了~";
							}
						}
						var timer = setTimeout(function() {
							that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
					},
					fail: function(res) {
						uni.showToast({
							title: "网络不太好哦~",
							icon: 'none'
						})
						var timer = setTimeout(function() {
							that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
						that.moreText = "加载更多";
						that.isLoad = 0;
					}
				})
			},
			toInfo(data) {
				var that = this;

				uni.navigateTo({
					url: '/pages/contents/info?cid=' + data.cid + "&title=" + data.title
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
			formatNumber(num) {
				return num >= 1e3 && num < 1e4 ? (num / 1e3).toFixed(1) + 'k' : num >= 1e4 ? (num / 1e4).toFixed(1) + 'w' :
					num
			},
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
			toLink(text) {
				var that = this;
				that.isPost = false;
				if (!localStorage.getItem('token') || localStorage.getItem('token') == "") {
					uni.showToast({
						title: "请先登录哦",
						icon: 'none'
					})
					uni.navigateTo({
						url: '/pages/user/login'
					});
					return false;
				}
				uni.navigateTo({
					url: text
				});
			},
			toSearch() {
				var that = this;

				uni.navigateTo({
					url: '/pages/contents/search'
				});
			}
		}
	}
</script>

<style>
	/* 置顶标签样式 */
	.hot-top {
		font-size: 25upx;
		line-height: 25upx;
		padding: 4upx 4upx;
		border-radius: 8upx;
		margin-left: 0upx;
		margin-top: -4upx;
		color: #ffffff;
		/* 增加右侧间距 */
		margin-left: 0upx;
		vertical-align: middle;
		/* 垂直居中对齐 */ 
	}
	/* 添加Tab样式 */
	.tn-tabs__header {
		border-radius: 20rpx;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		height: 80rpx;
		background-color: #ffffff;
	}

	.tn-tabs__item {
		position: relative;
		padding: 0 20rpx;
	}

	.tn-tabs__item--active {
		color: #01BEFF;
	}

	.tn-tabs__item--active::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: -10rpx;
		transform: translateX(-50%);
		width: 40rpx;
		height: 4rpx;
		background-color: #01BEFF;
		border-radius: 2rpx;
	}

	.tn-tabs__item-title {
		font-size: 28rpx;
	}
</style>