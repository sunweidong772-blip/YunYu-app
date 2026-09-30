<template>
	<view :class="$store.state.AppStyle">
		<view class="header" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar bg-white" :style="{'height': CustomBar + 'px','padding-top':StatusBar + 'px'}">
				<view class="action" @tap="toSearch">
					<text class="cuIcon-friendadd"></text>
				</view>
				<view class="content text-bold" :style="[{top:StatusBar + 'px'}]">
					消息中心
				</view>
				<view class="action">
					<text class="text-blue" @tap="setRead()">全部已读</text>
				</view>
			</view>
		</view>
		<view :style="[{padding:NavBar + 'px 10px 0px 10px'}]"></view>
		<view class="data-box">
			<view class="index-sort grid col-4 inbox-sort">
				<view class="index-sort-box">
					<view itemClass="butclass">
						<view class="index-sort-main" @tap="goPage('/pages/user/fanList?uid='+uid)">
							<view class="index-sort-i" style="background-color: #ec3333;">
								<text class="cuIcon-friendaddfill"></text>
								<text class="unreadNum bg-red" v-if="unreadData.fan>0">{{unreadData.fan}}</text>
							</view>
							<view class="index-sort-text">
								粉丝
							</view>
						</view>
					</view>
				</view>
				<view class="index-sort-box">
					<view itemClass="butclass">
						<view class="index-sort-main" @tap="goPage('/pages/inbox/message')">
							<view class="index-sort-i" style="background-color: #4b81ff;">
								<text class="cuIcon-markfill"></text>
								<text class="unreadNum bg-red" v-if="unreadData.comment>0">{{unreadData.comment}}</text>
							</view>
							<view class="index-sort-text">
								评论
							</view>
						</view>
					</view>
				</view>
				<view class="index-sort-box">
					<view itemClass="butclass">
						<view class="index-sort-main" @tap="goPage('/pages/inbox/message?type=finance')">
							<view class="index-sort-i" style="background-color: #009a00;">
								<text class="cuIcon-rechargefill"></text>
								<text class="unreadNum bg-red" v-if="unreadData.finance>0">{{unreadData.finance}}</text>
							</view>
							<view class="index-sort-text">
								财务
							</view>
						</view>
					</view>
				</view>
				<view class="index-sort-box">
					<view itemClass="butclass">
						<view class="index-sort-main" @tap="goPage('/pages/inbox/message?type=system')">
							<view class="index-sort-i" style="background-color: #ee460e;">
								<text class="cuIcon-noticefill"></text>
								<text class="unreadNum bg-red" v-if="unreadData.system>0">{{unreadData.system}}</text>
							</view>
							<view class="index-sort-text">
								系统
							</view>
						</view>
					</view>
				</view>
			</view>
			<view v-if="token">
				<view class="no-data" v-if="chatList.length==0">
					暂时没有消息
				</view>
				
				<view class="cu-list menu-avatar" v-if="chatList.length>0">
					<block v-for="(item,index) in chatList" :key="index">
						<view class="cu-item">
							<view class="cu-avatar round lg" :style="'background-image:url('+item.userJson.avatar+');'" @tap="toUserContents(item.userJson)"></view>
							<view class="content" @tap="goChat(item)">
								<view>
									<!-- <view class="text-cut">{{item.userJson.name}}</view> -->
									<!--  #ifdef H5 || APP-PLUS -->
									<block v-if="item.userJson.isvip > 0">
										<text v-if="item.userJson.isvip==1" class="content-author-name tn-text-bold"
											style="color: #f2ad5c;" @tap="toUser(item)">{{item.userJson.name}}</text>
										<text v-if="item.userJson.isvip==2" class="content-author-name text-bold"
											style="color: #e6216d;" @tap="toUser(item)">{{item.userJson.name}}</text>
										<text class="userlv" v-if="item.userJson.isvip==1"
											style="background: linear-gradient(to bottom right, #f2ad5c, #e6216d,#901ccb);color:white;padding: 3px 5px;border-radius: 10px;">
											VIP
										</text>
									</block>
									<block v-else>
										<text class="content-author-name " :style="{color:item.userJson.screenNamecolor}"
											@tap="toUser(item)">{{item.userJson.name}}</text>
									</block>
									<text class="userlv"
										:style="getLvStyle(item.userJson.experience)">{{getLv(item.userJson.experience)}}
									</text>
									<text class="group customize adm" v-if="item.userJson.groupKey =='administrator'">管理员
									</text>
									<text class="group customize" v-if="item.userJson.groupKey =='editor'">编辑
									</text>
									<text class="group" :style="{backgroundColor:item.userJson.customizecolor}"
										v-if="item.userJson.customize&&item.userJson.customize!=''">
										{{item.userJson.customize}}
									</text>
									<!--  #endif -->
								</view>
								<view class="text-gray text-sm flex">
									<view class="text-cut">
										<block v-if="item.lastMsg!=null">

											<block v-if="item.lastMsg.type!=4">
												<block v-if="item.lastMsg.uid==uid">
													我:
												</block>
												<block v-else>
													{{item.userJson.name}}:
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
													<block v-if="item.lastMsg.uid==uid">

														<text class="text-blue">[你屏蔽了对方]</text>
													</block>
													<block v-else>
														<text class="text-blue">[对方屏蔽了你]</text>

													</block>
												</block>
												<block v-else>
													<block v-if="item.lastMsg.uid==uid">

														<text class="text-blue">[你解除了屏蔽]</text>
													</block>
													<block v-else>
														<text class="text-blue">[对方解除了屏蔽]</text>

													</block>
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
									<block v-if="item.uid==uid">
										<view class="cu-tag sm" style="background: none;" v-if="item.myUnRead == 0">
											&nbsp</view>
										<view class="cu-tag round bg-red sm" v-else>
											{{item.myUnRead>99?'99+':item.myUnRead}}</view>
									</block>
									<block v-else>
										<view class="cu-tag sm" style="background: none;" v-if="item.otherUnRead == 0">
											&nbsp</view>
										<view class="cu-tag round bg-red sm" v-else>
											{{item.otherUnRead > 99?'99+':item.otherUnRead}}</view>
									</block>
								</block>
								<block v-else>
									<view class="cu-tag sm" style="background: none;">&nbsp</view>
								</block>
							</view>
						</view>
					</block>
				</view>
			</view>
			<view v-else>
				<view class="no-data">
					<text class="cuIcon-community"></text>
					请先登录哦！
					<view class="text-center margin-top-sm">
						<text class="cu-btn bg-shojo radius" style="border-radius: 50px;" @tap="goLogin()">登录</text>
						<text class="cu-btn bg-shojo margin-left-sm" style="border-radius: 50px;"
							@tap="goRegister()">注册</text>
					</view>
				</view>
			</view>

		</view>
		<!--加载遮罩-->
		<view class="loading" v-if="isLoading==0&&token">
			<view class="loading-main">
				<image src="../../static/loading.gif"></image>
			</view>
		</view>
		<!--加载遮罩结束-->
		<!--  #ifdef APP-PLUS -->
		<!-- <view style="height: 100upx;"></view>
		<Tabbar :current="2"></Tabbar> -->
		<!--  #endif -->

	</view>
</template>

<script>
	import {
		localStorage
	} from '../../js_sdk/mp-storage/mp-storage/index.js'
	import waves from '@/components/xxley-waves/waves.vue';
	// #ifdef APP-PLUS
	// import Tabbar from '@/pages/components/tabBar.vue'
	import owo from '../../static/app-plus/owo/OwO.js'
	// #endif
	// #ifdef H5
	import owo from '../../static/h5/owo/OwO.js'
	// #endif
	// #ifdef MP
	var owo = [];
	// #endif
	export default {
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				NavBar: this.StatusBar + this.CustomBar,
				AppStyle: this.$store.state.AppStyle,
				isLoading: 0,
				isLoad:0,
				chatList: [],
				page: 1,
				msgLoading: null,
				uid: 0,
				token: "",
				unreadData: {
					chat: 0,
					comment: 0,
					fan: 0,
					finance: 0,
					system: 0,
					total: 0,
				}

			}
		},
		onPullDownRefresh() {
			var that = this
			clearInterval(that.msgLoading);
			that.msgLoading = null
			that.page = 1;
			that.getMyChat(false);
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onBackPress() {
			var that = this
			clearInterval(that.msgLoading);
			that.msgLoading = null;
		},
		onUnload() {
			var that = this
			clearInterval(that.msgLoading);
			that.msgLoading = null;
		},
		onReachBottom() {
			//触底后执行的方法，比如无限加载之类的
			var that = this;
		},
		onShow() {
			var that = this;
			that.page = 1;
			if (localStorage.getItem('userinfo')) {
				var userInfo = JSON.parse(localStorage.getItem('userinfo'));
				that.uid = userInfo.uid;
			}
			if (localStorage.getItem('token')) {
				that.token = localStorage.getItem('token');
				that.msgLoading = setInterval(() => {
					that.getMyChat(false);
				}, 3000);
			}
			that.unreadNum();
		
		},
		onLoad() {
			var that = this;
			// #ifdef APP-PLUS || MP
			that.NavBar = this.CustomBar;
			// #endif
		},
		methods: {
			back() {
				var that = this;
				clearInterval(that.msgLoading);
				that.msgLoading = null
				uni.navigateBack({
					delta: 1
				});
			},
			loadMore() {
				var that = this;

				if (that.isLoad == 0) {

					that.moreText = "正在加载中...";
					that.getMyChat(true);
				}
			},
			setRead() {
				var that = this;
				that.$Net.request({
					url: that.$API.setRead(),
					data: {
						"token": that.token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if (res.data.code == 1) {
							uni.showToast({
								title: "操作成功！",
								icon: 'none'
							})
							uni.hideTabBarRedDot({
								index:2
							})
							localStorage.setItem('noticeSum',0);
							var chatList = that.chatList;
							for (var i in chatList) {
								chatList[i].myUnRead = 0;
								chatList[i].otherUnRead = 0;
							}
							that.chatList = chatList;
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
			replaceSpecialChar(text) {
				if (!text) {
					return false;
				}
				text = text.replace(/&quot;/g, '"');
				text = text.replace(/&amp;/g, '&');
				text = text.replace(/&lt;/g, '<');
				text = text.replace(/&gt;/g, '>');
				text = text.replace(/&nbsp;/g, ' ');
				return text;
			},
			//为了性能考虑，只显示最近30条聊天
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
					url: that.$API.myChat(),
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
						// console.log(res.data.data.userJson)
						// that.isLoading = 1;
						that.isLoad = 0;
						if (res.data.code == 1) {
							var list = res.data.data;
							if (list.length > 0) {
								var chatList = list;
								if (isPage) {
									that.page++;
									that.chatList = that.chatList.concat(chatList);
								} else {
									that.chatList = chatList;
								}
							} else {
								that.moreText = "没有更多消息了";
							}

						}
						var timer = setTimeout(function() {
							that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
					},
					fail: function(res) {
						that.isLoad = 0;
						that.isLoading = 1;
						that.moreText = "加载更多";
						var timer = setTimeout(function() {
							that.isLoading = 1;
							clearTimeout('timer')
						}, 300)
					}
				})
			},
			goChat(data) {
				var that = this;
				clearInterval(that.msgLoading);
				that.msgLoading = null
				var chatid = data.id;
				//去除未读标志
				var chatList = that.chatList;
				for (var i in chatList) {
					if (chatList[i].id == chatid) {
						chatList[i].isNew = 0;
						chatList[i].unRead = 0;
					}
				}
				that.chatList = chatList;
				that.oldChatList = chatList;
				localStorage.setItem('chatList', JSON.stringify(chatList));
				if(chatList==''){
					uni.hideTabBarRedDot({
						index:2
					})
				}
				//结束
				var name = data.userJson.name;
				var uid = data.userJson.uid;
				clearInterval(that.msgLoading);
				that.msgLoading = null
				uni.navigateTo({
					url: '/pages/chat/chat?uid=' + uid + "&name=" + name + "&chatid=" + chatid
				});
			},
			goPage(url) {
				var that = this;
				if (!localStorage.getItem('token') || localStorage.getItem('token') == "") {
					uni.showToast({
						title: "请先登录哦",
						icon: 'none'
					})
					return false;
				}
				uni.navigateTo({
					url: url
				});
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
							that.isLoading = 1;
							that.unreadData = res.data.data;
							that.noticeSum = Number(localStorage.getItem('noticeSum'));
							if(that.unreadData.total > 0){
								uni.setTabBarBadge({
								  index: 2,
								  text: that.noticeSum.toString()
								})
							}else{
								uni.hideTabBarRedDot({
									index:2
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
			toSearch() {
				var that = this;
				uni.navigateTo({
					url: '/pages/contents/search'
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

		},
		// #ifdef APP-PLUS
		components: {
			// Tabbar
		},
		// #endif

		// #ifdef H5 || MP

		components: {
			// 'tabbar': {
			// 	// 组件选项
			// }
		},
		// #endif
	}
</script>

<style>
	
</style>