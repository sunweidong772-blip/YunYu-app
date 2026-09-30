<template>
	<view class="user" :class="$store.state.AppStyle">
		<view class="homepage">
			<view class="bar" >
				<u-navbar :placeholder="true" bgColor="#f6f6f6">
					<view slot="left"></view>
					<view slot="right" class="right">
						<view @tap="toLink('/pages/user/useredit?type=addinfo')">
							<text class="tn-icon-write" style="font-size: 40upx;"></text>
						</view>
						<view @tap="toSetUp()">
							<text class="tn-icon-set" style="font-size: 40upx;"></text>
						</view>
						<!-- #ifdef APP-PLUS -->
						<view @tap="toScan">
							<text class="tn-icon-scan" style="font-size: 40upx;"></text>
						</view>
						<!-- #endif -->
						<!-- <view @tap="goStyle()">
							<text class="cuIcon-clothes" @tap="goStyle"></text>
						</view> -->
					</view>
				</u-navbar>
			</view>
			<view class="people">
				<view class="headImg">
					<!-- <image src="../../static/image/travel/personal/tx.png"> -->
					<!-- {{userInfo}} -->
					<view class="avatar" v-if="userInfo" :style="userInfo.style" @tap="toUserContents()"></view>
					<view class="avatar" style="background-color: #ccc;" v-else></view>
				</view>
				<view class="info" v-if="userInfo != null">
					<view class="nick" style="display: flex; align-items: center;" @click="copyName">
						<!-- vip -->
						<block v-if="isvip > 0">
							<text v-if="isvip==1" class="content-author-name tn-text-bold" style="color: #f2ad5c;">
								{{name}}
							</text>
							<text v-else-if="isvip==2" class="content-author-name text-blue" style="color: #e6216d;">
								{{name}}
							</text>
						</block>
						<block v-else>
							<text class="content-author-name" :style="{color:userInfo.screenNamecolor}">
								{{name}}
							</text>
						</block>
						<!-- vip -->
					</view>
					<view class="grade">
						<view style="margin-right: 10upx;color: #454545ed;">UID:{{uid}}</view>
						<text class="tn-icon-copy mirror cuIcon-copy" @click="copyUid"></text>
					</view>
					<view class="content flex-sub" style="margin-top: 10upx;">
						
						<text class="userlv" v-if="isvip"
							style="margin-left: 0px;background: linear-gradient(to bottom right, #f2ad5c, #e6216d,#901ccb);color:white;padding: 2upx 10upx;border-radius: 20upx;">
							VIP
						</text>
						<text class="userlv" :style="lvStyle" :class="isvip ? '' : 'xyy'"
							style="padding: 2upx 10upx;">{{getLv(userInfo.experience)}}</text>
						<text class="group customize adm" style="color: #fff;" v-if="userInfo.group=='administrator'">管理员
						</text>
						<text class="group customize" style="color: #fff;" v-if="userInfo.group=='editor'">编辑
						</text>
						<text class="group purview" style="color: #fff;" v-if="myPurview">
							  {{getRestrictList(myPurview-1).name}}
						</text>
						<text class="group" :style="{backgroundColor:userInfo.customizecolor,color:'#fff'}"
							v-if="userInfo.customize&&userInfo.customize!=''">{{userInfo.customize}}
							</text>
							
					</view>
				</view>
				<view class="info" v-if="userInfo == null">
					<view class="nick" @tap="toLogin">
						<text>点击登录</text>
					</view>
				</view>
				<view class="space" v-if="userInfo != null">
					<text class="padding-lr-sm padding-tb-xs"
						style="border-radius: 40upx; background-color: #3cc9a4;color: white;padding: 10upx 40upx;"
						@tap="toClock">签到</text>
					<text class="padding-lr-sm padding-tb-xs"
						style="border-radius: 40upx; background-color: #e9a93c;color: white;padding: 10upx 40upx;margin-left: 12upx;"
						@tap="toCheckinCenter">签到中心</text>
				</view>
			</view>
			<view class="list" style="display: flex; justify-content: center;" v-if="userInfo != null">
				<view class="item">
					<view class="text" @tap="toLink('/pages/user/followList?uid='+uid)">
						<text>{{fancount}}</text>
						<text>关注</text>
					</view>
				</view>
				<view class="item">
					<u-line direction="col" color="#979797 " length="32rpx"></u-line>
				</view>
				<view class="item" @tap="toLink('/pages/user/fanList?uid='+uid)">
					<view class="text">
						<text>{{formatNumber(userData.fanNum)}}</text>
						<text>粉丝</text>
					</view>
				</view>
				<view class="item">
					<u-line direction="col" color="#979797 " length="32rpx"></u-line>
				</view>
				<view class="item" @tap="toLink('/pages/user/usercomments')">
					<view class="text">
						<text>{{userData.commentsNum}}</text>
						<text>评论</text>
					</view>
				</view>
				<view class="item">
					<u-line direction="col" color="#979797 " length="32rpx"></u-line>
				</view>
				<view class="item" @tap="toLink('/pages/user/assets')">
					<view class="text">
						<text>{{formatNumber(userData.assets)}}</text>
						<text>{{currencyName}}</text>
					</view>
				</view>
			</view>
			<view class="infos">
				<!--<br>
				<view class="account-pay"></view>-->
				<view v-if="isvip" class="open-vip" @tap="toLink('/pages/user/buyvip')">
					<image src="/static/image/travel/personal/vip01.png"></image>
					<text class="text" style="font-weight: bold;">已开通尊贵VIP</text>
					<image src="/static/image/travel/personal/vip03.png" style="width: 55px; height: 20px;"></image>
				</view>
				<view v-else class="open-vip" @tap="toLink('/pages/user/buyvip')">
					<image src="/static/image/travel/personal/vip01.png"></image>
					<text class="text" style="font-weight: bold;">开通VIP享受十余项尊贵特权</text>
					<image src="/static/image/travel/personal/vip03.png" style="width: 55px; height: 20px;"></image>
				</view>
					<view class="tool">
						<view style="display: flex;align-items: center;" @tap="toLink('/pages/user/userpost')">
							<image src="/static/image/travel/personal/member.png"></image>
							<text>帖子</text>
						</view>
						<view style="display: flex;align-items: center;" @tap="toLink('/pages/user/myshop')">
							<image src="/static/image/travel/personal/house.png"></image>
							<text>商品</text>
						</view>
						<view style="display: flex;align-items: center;" @tap="toLink('/pages/user/assets')">
							<image src="/static/image/travel/personal/money.png"></image>
							<text>钱包</text>
						</view>
						<view style="display: flex;align-items: center;" @tap="toLink('/pages/user/checkin')">
							<image src="/static/image/travel/personal/task.png"></image>
							<text>签到</text>
						</view>
						<view style="display: flex;align-items: center;" @tap="toLink('/pages/activity/center')">
							<image src="/static/image/travel/personal/task.png"></image>
							<text>活动</text>
						</view>
						<view style="display: flex;align-items: center;" @tap="toLink('/pages/user/userexp')">
							<image src="/static/image/travel/personal/task.png"></image>
							<text>等级</text>
						</view>
					</view>
				<view class="set">
					<view @tap="toManage" v-if="group=='administrator'||group=='editor'">
						<view class="tn-flex-1 tn-flex tn-flex-col-center">
							<text class="tn-icon-set" style="margin-left:8px"></text>
							<text>管理中心</text>
						</view>
						<view class="tn-flex tn-text-justify">
							<text></text>
							<image class="right" src="../../static/image/travel/personal/Clipped.png">
						</view>
					</view>
					<view @tap="toLink('/pages/manage/postReview')" v-if="myPurview>=1">
						<view class="tn-flex-1 tn-flex tn-flex-col-center">
							<text class="tn-icon-set" style="margin-left:8px"></text>
							<text>帖子审核</text>
						</view>
						<view class="tn-flex tn-text-justify">
							<text></text>
							<image class="right" src="../../static/image/travel/personal/Clipped.png">
						</view>
					</view>
					<view @tap="toRebate" v-if="userInfo!=null">
						<view class="tn-flex-1 tn-flex tn-flex-col-center">
							<text class="tn-icon-refund" style="margin-left:8px"></text>
							<text>获取{{currencyName}}</text>
						</view>
						<view class="tn-flex tn-text-justify">
							<text></text>
							<image class="right" src="../../static/image/travel/personal/Clipped.png">
						</view>
					</view>
					<view @tap="toLink('/pages/user/userpost')">
						<text class="tn-icon-order" style="margin-left:8px"></text>
						<view class="tn-flex-1">
							<text>我的帖子</text>
						</view>
						<view class="tn-flex tn-text-justify">
							<text>{{userData.contentsNum}}</text>
							<image class="right" src="../../static/image/travel/personal/Clipped.png">
						</view>
					</view>
					<view @tap="toLink('/pages/user/usermark')">
						<text class="tn-icon-like-lack" style="margin-left:8px"></text>
						<view class="tn-flex-1">
							<text>我的收藏</text>
						</view>
						<view class="tn-flex tn-text-justify">
							<text></text>
							<image class="right" src="../../static/image/travel/personal/Clipped.png">
						</view>
					</view>
					<view @tap="toLink('/pages/space/mySpace')">
						<text class="tn-icon-order" style="margin-left:8px"></text>
						<view class="tn-flex-1">
							<text>我的动态</text>
						</view>
						<view class="tn-flex tn-text-justify">
							<text></text>
							<image class="right" src="../../static/image/travel/personal/Clipped.png">
						</view>
					</view>

				</view>
				
				<view class="set">
					<!-- <view @tap="toLink('/pages/user/jilu')">
						<text class="tn-icon-shop" style="margin-left:8px"></text>
						<view class="tn-flex-1">
							<text>我的商品</text>
						</view>
						<image class="right" style="float: right;" src="../../static/image/travel/personal/Clipped.png">
					</view>
					<view @tap="toLink('/pages/user/sellorder')">
						<text class="tn-icon-order" style="margin-left:8px"></text>
						<view class="tn-flex-1">
							<text>售出订单</text>
						</view>
						<image class="right" style="float: right;" src="../../static/image/travel/personal/Clipped.png">
					</view> -->
					<view @tap="toSetUp">
						<view class="tn-flex-1 tn-flex tn-text-justify">
							<text class="tn-icon-identity" style="margin-left:8px"></text>
							<text>账户设置</text>
						</view>
						<image class="right" style="float: right;" src="../../static/image/travel/personal/Clipped.png">
					</view>
					<view @tap="toMedia">
						<text class="tn-icon-service" style="margin-left:8px"></text>
						<view class="tn-flex-1">
							<text>联系我们</text>
						</view>
						<image class="right" style="float: right;" src="../../static/image/travel/personal/Clipped.png">
					</view>
					<view @tap="toAbout()">
						<text class="tn-icon-cube" style="margin-left:8px"></text>
						<view class="tn-flex-1">
							<text>关于我们</text>
						</view>
						<image class="right" style="float: right;" src="../../static/image/travel/personal/Clipped.png">
					</view>
				</view>
				<u-divider text="分割线"></u-divider>
			</view>

		</view>


		<!--  #ifdef APP-PLUS -->
		<!-- <view style="height: 100upx;"></view>
		<Tabbar :current="3"></Tabbar> -->
		<!--  #endif -->
		<view class="cu-modal userLoginstatus" :class="isLoginShow?'show':''">
			<view class="cu-dialog">

				<view class="padding-sm">
					<view class="padding flex flex-direction">
						<view class="userLoginstatus-i bg-red">
							<text class="cuIcon-close"></text>
						</view>
						<view class="text-bold">登录状态已失效</view>

						<button class="cu-btn bg-blue margin-top" @tap="isLoginShow=false">确定</button>
					</view>
				</view>

			</view>
		</view>
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
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				NavBar: this.StatusBar + this.CustomBar,
				AppStyle: this.$store.state.AppStyle,
				userInfo: null,
				name: "",
				uid: 0,
				token: "",
				userData: {},
				isClock: 0,
				group: "",
				avatar: "",
				isvip: 0,
				vip: 0,
				fancount: 0,

				feedback: this.$API.GetFeedback(),
				userlvStyle: "",
				lvStyle: "",

				aboutme: this.$API.GetAboutme(),

				isLoginShow: false,

				noticeSum: 0,

				isModerator: false,

				currencyName: "",

				modalName: null,
				curFullStyle: "",
				myPurview:0,
			}
		},
		onPullDownRefresh() {
			var that = this;
			console.log("触发下拉刷新");
			that.getUserData();
			that.userStatus();
			that.unreadNum();
		},
		onShow() {
			var that = this;
			// #ifdef APP-PLUS
			// uni.hideTabBar({
			// 	animation: false
			// })
			plus.navigator.setStatusBarStyle("dark")
			// #endif
			// 1111111111111
			that.currencyName = that.$API.getCurrencyName();
			if (localStorage.getItem('userinfo')) {
				that.userInfo = JSON.parse(localStorage.getItem('userinfo'));
				that.userInfo.style = "background-image:url(" + that.userInfo.avatar + ");"
				that.avatar = that.userInfo.avatar;
				that.uid = that.userInfo.uid;
				that.group = that.userInfo.group;
				if (that.userInfo.screenName) {
					that.name = that.userInfo.screenName;
				} else {
					that.name = that.userInfo.name;
				}
			} else {
				that.userInfo = null;
			}
			if (localStorage.getItem('token')) {

				that.token = localStorage.getItem('token');
			} else {
				that.token = "";
			}
			that.getUserData();
			that.userStatus();
			that.unreadNum();
			that.getgg();
			if (localStorage.getItem('curFullStyle')) {
				that.curFullStyle = localStorage.getItem('curFullStyle');
			}
			// 1111111111
		},
		onLoad() {
			var that = this;
			// #ifdef APP-PLUS || MP
			that.NavBar = this.CustomBar;
			// #endif
			if (localStorage.getItem('token')) {
				that.token = localStorage.getItem('token');
			} else {
				that.token = "";
			}
			that.userStatus();
			that.userPurview();
		},
		mounted() {
			var that = this;
			// #ifdef APP-PLUS || MP
			that.NavBar = this.CustomBar;
			// #endif
		},
		methods: {
			getgg() {
				// FAST_URL(sb.520771.xyz) 已移除
			},
			getRestrictList(i) {
				var that = this;
				if (!i) {
					var i = 0;
				}
				var restrictList = that.$API.GetRestrictList();
				return restrictList[i];
			},
			toLogin() {
				var that = this;
				uni.navigateTo({
					url: '/pages/user/login'
				});

			},
			hideModal(e) {
				this.modalName = null
			},
			getUserLv(i) {
				var that = this;
				var rankList = that.$API.GetRankList();
				var rankStyle = that.$API.GetRankStyle();
				that.userlvStyle = "color:#fff;background-color: " + rankStyle[i];
				return rankList[i];
			},
			getLv(i) {
				var that = this;
				var lv = that.$API.getLever(i);
				var leverList = that.$API.GetLeverList();
				var rankStyle = that.$API.GetRankStyle();
				that.lvStyle = "color:#fff;background-color: " + rankStyle[lv];
				return leverList[lv];
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
			toPage(title, cid) {
				var that = this;

				uni.navigateTo({
					url: '/pages/contents/info?cid=' + cid + "&title=" + title
				});
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
						// console.log(res)
						if (res.data.code == 0 || res.data.code == 401) {

							if (that.userInfo != null) {
								that.isLoginShow = true;
							}
							localStorage.removeItem('userinfo');
							localStorage.removeItem('token');

							that.userInfo = null;
							that.token = "";
							that.userData = {};
							that.fancount = 0;
						} else if (res.data.data) {

							if (localStorage.getItem('userinfo')) {

								var userInfo = JSON.parse(localStorage.getItem('userinfo'));
								if (userInfo.screenName) {
									that.name = userInfo.screenName;
								} else {
									that.name = userInfo.name;
								}
								if (res.data.data.customize) {
									userInfo.customize = res.data.data.customize;
								}
								if (res.data.data.customizecolor) {
									userInfo.customizecolor = res.data.data.customizecolor;
								}
								if (res.data.data.screenNamecolor) {
									userInfo.screenNamecolor = res.data.data.screenNamecolor;
									// console.log(userInfo.screenNamecolor)
								}
								if (res.data.data.lv) {
									userInfo.lv = res.data.data.lv;
								}
								if (res.data.data.isvip) {
									userInfo.isvip = res.data.data.isvip;
									that.isvip = res.data.data.isvip;

								}
								if (res.data.data.vip) {
									userInfo.vip = res.data.data.vip;
								}
								if (res.data.data.experience) {
									userInfo.experience = res.data.data.experience;
								}
								localStorage.setItem('userinfo', JSON.stringify(userInfo));

								// if(res.data.data.avatar){
								// 	that.userInfo = res.data.data.avatar;
								// }

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
			toGroup() {
				// FAST_URL(sb.520771.xyz) 已移除
			},
			getUserData() {
				var that = this;
				that.$Net.request({

					url: that.$API.getUserData(),
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
							that.userData = res.data.data;
							that.isClock = res.data.data.isClock;
							that.fancount = res.data.data.followNum || 0;
						} else if (res.data.code == 401) {
							localStorage.removeItem('userinfo');
							localStorage.removeItem('token');
							that.userInfo = null;
							that.token = "";
							that.userData = {};
							that.fancount = 0;
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
						// console.log(res)
						if(res.data.code==1){
							var list = res.data.data;
							if(list.length>0){
								for(var i in list){
									if(list[i].sectionId){
										that.myPurview = list[i].purview;
										
									}
								}
								
							}
							if(that.myPurview){
								
							}
							// console.log(that.myPurview)
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
			formatNumber(num) {
				if (num == 0 || !num) {
					return 0;
				}
				return num >= 1e3 && num < 1e4 ? (num / 1e3).toFixed(1) + 'k' : num >= 1e4 ? (num / 1e4).toFixed(1) + 'w' :
					num
			},
			toCheckinCenter() {
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
			toClock() {

				var that = this;
				var data = {
					"type": "clock",
				}
				uni.showLoading({
					title: "加载中"
				});
				that.$Net.request({

					url: that.$API.addLog(),
					data: {
						"params": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"token": that.token
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {

						setTimeout(function() {
							uni.hideLoading();
						}, 500);

						if (res.data.code == 1) {
							that.isClock = 1;
							var clockData = res.data.clockData;
							uni.showToast({
								title: "签到成功！获得" + clockData.award + that.$API.getCurrencyName() +
									"，" + clockData.addExp + "经验",
								icon: 'none'
							})
							that.isClock == 1;

						} else {
							uni.showToast({
								title: res.data.msg,
								icon: 'none'
							})
						}

					},
					fail: function(res) {
						setTimeout(function() {
							uni.hideLoading();
						}, 500);
						uni.showToast({
							title: "网络开小差了哦",
							icon: 'none'
						})
					}
				})
			},
			copyName() {
				var that = this;
				uni.setClipboardData({
					data: that.name,
					success: function() {
						uni.showToast({
							title: '昵称已复制',
							icon: 'success'
						})
					}
				})
			},
			copyUid() {
				var that = this;
				uni.setClipboardData({
					data: that.uid,
					success: function() {
						uni.showToast({
							title: 'ID已复制',
							icon: 'success'
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
			toMedia() {
				uni.navigateTo({
					url: '/pages/user/media'
				});
			},
			toSetUp() {
				var that = this;

				uni.navigateTo({
					url: '/pages/user/setup'
				});
			},
			toRebate() {
				var that = this;

				uni.navigateTo({
					url: '/pages/user/rebate'
				});
			},
			toManage() {
				uni.navigateTo({
					url: '/pages/user/manage'
				});
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

				if (that.isJSON(text)) {
					text = JSON.parse(text);
				} else {
					uni.showToast({
						title: "无法解析的内容！",
						icon: 'none'
					})
					return false;
				}
				if (text.type) {
					if (text.type == "Scan") {
						if (that.token == "") {
							uni.showToast({
								title: "请先登录",
								icon: 'none'
							})
							return false;
						}
						uni.navigateTo({
							url: '/pages/user/scan?text=' + text.data
						});
						return false;
					} else if (text.type == "Invite") {
						uni.navigateTo({
							url: '/pages/user/register?inviteCode=' + text.code
						});
						return false;
					} else {
						uni.showToast({
							title: "无法解析的内容！",
							icon: 'none'
						})
						return false;
					}
				} else {
					uni.showToast({
						title: "无法解析的内容！",
						icon: 'none'
					})
					return false;
				}


			},
			toPage(title, cid) {
				var that = this;

				uni.navigateTo({
					url: '/pages/contents/info?cid=' + cid + "&title=" + title
				});
			},
			goStyle() {
				var that = this;

				uni.navigateTo({
					url: '/pages/user/clothes'
				});
			},
			toAbout() {
				var that = this;

				uni.navigateTo({
					url: '/pages/home/about'
				});
			},
			isJSON(str) {

				if (typeof str == 'string') {
					try {
						var obj = JSON.parse(str);
						if (typeof obj == 'object' && obj) {
							return true;
						} else {
							return false;
						}
					} catch (e) {
						console.log('error：' + str + '!!!' + e);
						return false;
					}
				}
			},
			unreadNum() {
				var that = this;
				if (localStorage.getItem('noticeSum')) {
					that.noticeSum = Number(localStorage.getItem('noticeSum'));
				}
			},
			goFanList(uid) {
				var that = this;

				uni.navigateTo({
					url: '/pages/user/fanList?uid=' + uid
				});
			},
			toUserContents() {
				var that = this;
				var name = that.name;
				var title = that.name + "的信息";
				var id = that.uid;
				var type = "user";
				uni.navigateTo({
					url: '/pages/contents/userinfo?title=' + title + "&name=" + name + "&uid=" + id + "&avatar=" +
						encodeURIComponent(that.avatar)
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
		},
		// #endif
	}
</script>

<style scoped>
	.list-margin {
		margin: 0 20rpx;
	}

	.margin-ver {
		margin: 20rpx 20rpx;
	}

	::v-deep .cu-list.menu>.cu-item {
		background-color: transparent;
	}

	.account-pay {
		background-image: url('../../static/page/bg_my_vip.png');
		background-repeat: no-repeat;
		background-size: 100% 100%;
		height: 96rpx;
		line-height: 72rpx;
		border-radius: 49rpx;
		/* color: #fff; */
	}

	::v-deep .account-pay .cu-item {
		min-height: auto;
		height: 72rpx;
	}

	::v-deep .cu-list.menu-avatar>.cu-item:after,
	.cu-list.menu>.cu-item:after {
		border: none;
	}
</style>
<style lang="scss" scoped>
	.homepage {
		width: 100%;

		& text {
			color: #333333;
			font-family: PingFangSC-Semibold, PingFang SC;
		}

		& text.cuIcon {
			font-family: 'cuIcon';
		}

		.bar {
			.right {
				display: flex;

				& view {
					width: 52rpx;
					height: 52rpx;
					margin-left: 26rpx;
					border-radius: 26rpx;
					display: flex;
					justify-content: center;
					align-items: center;
					box-shadow: 0rpx -2rpx 2rpx 4rpx rgba(255, 255, 255, 0.5000), 0rpx 4rpx 4rpx 0rpx rgba(197, 183, 211, 0.5000), inset 0rpx 2rpx 6rpx 0rpx rgba(255, 255, 255, 0.5000);

					>image {
						width: 32rpx;
						height: 32rpx;
					}
				}
			}
		}

		.people {
			padding: 0 42rpx 28rpx 32rpx;
			display: flex;
			align-items: center;
			.headImg {
				// >image {
				// 	width: 166rpx;
				// 	height: 166rpx;
				// 	border-radius: 83rpx;
				// }
				width: 150rpx;
				height: 150rpx;
				border-radius: 83rpx;
				;
				overflow: hidden;
				margin-right: 20rpx;
			}

			.info {
				flex: 1;

				.nick {
					display: flex;

					>text {
						font-size: 36rpx;
						font-weight: 600;
						line-height: 50rpx;
					}

					.sex {
						width: 24rpx;
						height: 24rpx;
						border-radius: 12rpx;
						background: #61C9FD;
					}
				}

				.grade {
					display: flex;
					align-items: center;

					>view {
						display: flex;
						align-items: center;
						margin-right: 12rpx;

						& text {
							font-size: 20rpx;
							font-weight: 600;
							color: #FFFFFF;
							line-height: 28rpx;
							text-shadow: 0rpx 2rpx 4rpx #cbffea;
						}

						& image {
							width: 28rpx;
							height: 30rpx;
						}

						&:last-child {
							>image {
								width: 40rpx;
								height: 40rpx;
							}

							>text {
								margin-left: -6rpx;
							}
						}
					}
				}

				.userId {
					width: 220rpx;
					display: flex;
					background: #F5F5FF;
					border-radius: 8rpx;
					box-shadow: 0rpx 2rpx 6rpx 0rpx rgba(0, 0, 0, 0.1400), 0rpx -4rpx 6rpx 0rpx #FFFFFF;

					>image {
						width: 36rpx;
						height: 40rpx;
					}

					.number {
						flex: 1;
						display: flex;
						justify-content: center;

						>text {
							font-size: 24rpx;
							font-weight: 600;
							line-height: 40rpx;

							&:last-child {
								font-weight: 500;
								font-size: 22rpx;
								margin-left: 8rpx;
							}
						}
					}
				}
			}

			.space {
				display: flex;
				align-items: center;

				>text {
					font-size: 28rpx;
					line-height: 40rpx;
				}
			}
		}

		.list {
			width: 100%;
			display: flex;
			padding: 0 44rpx;
			box-sizing: border-box;

			.item {
				width: 25%;
				display: flex;
				justify-content: space-evenly;
				align-items: center;

				.text {
					display: flex;
					flex-direction: column;
					align-items: center;

					>text:first-child {
						font-size: 36rpx;
						font-family: CloudHeiChaoGBK;
						line-height: 48rpx;
						font-weight: 600;
					}

					>text:last-child {
						font-size: 24rpx;
						color: #999999;
						line-height: 34rpx;
					}
				}
			}
		}

		.xyy {
			margin-left: 0px;
		}

		.infos {
			padding: 0 40rpx;

			.open-vip {
				width: 100%;
				height: 72rpx;
				background: linear-gradient(180deg, #F7E5B4 0%, #FFE6AF 2%, #EBC075 100%);
				border-radius: 49rpx;
				display: flex;
				align-items: center;
				margin-top: 36rpx;
				padding: 0 24rpx 0 34rpx;
				box-sizing: border-box;

				>image {
					width: 48rpx;
					height: 48rpx;
				}

				.text {
					flex: 1;
					font-size: 24rpx;
					line-height: 34rpx;
					margin-left: 14rpx;
				}

				.button {
					width: 128rpx;
					height: 42rpx;
					background: linear-gradient(90deg, #4D4D4D 0%, #151515 100%);
					border-radius: 22rpx;
					font-size: 22rpx;
					color: #FFDFA9;
					line-height: 42rpx;
					text-align: center;
				}
			}

			.tool {
				display: flex;
				width: 100%;
				height: 172rpx;
				background: #FFFFFF;
				box-shadow: 0rpx 2rpx 28rpx 0rpx #c2c2c257;
				border-radius: 28rpx;
				justify-content: space-evenly;
				margin: 22rpx 0;

				>view {
					display: flex;
					flex-direction: column;

					& text {
						font-size: 22rpx;
						font-weight: 600;
						color: #666666;
						line-height: 32rpx;
					}

					& image {
						width: 98rpx;
						height: 96rpx;
						margin-top: 10rpx;
					}
				}
			}

			.set {
				width: 100%;
				padding: 34rpx 24rpx 44rpx 34rpx;
				background: #FFFFFF;
				box-shadow: 0rpx 2rpx 28rpx 0rpx #c2c2c257;
				border-radius: 28rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				box-sizing: border-box;
				margin: 22rpx 0;
				>view {
					display: flex;
					align-items: center;
					margin-bottom: 40rpx;

					&:last-child {
						margin-bottom: 0;
					}

					& text {
						font-size: 28rpx;
						line-height: 40rpx;
						margin-left: 30rpx;
					}

					.icon {
						width: 36rpx;
						height: 36rpx;
					}

					.right {
						width: 40rpx;
						height: 40rpx;
					}
				}
			}

			.service {
				background: #FFFFFF;
				box-shadow: 0rpx 2rpx 28rpx 0rpx rgba(142, 146, 230, 0.2700);
				border-radius: 28rpx;
				margin-top: 26rpx;
				padding: 34rpx 24rpx 44rpx 34rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;

				>view {
					display: flex;
					align-items: center;
					margin-bottom: 40rpx;

					& text {
						flex: 1;
						font-size: 28rpx;
						line-height: 40rpx;
						margin-left: 30rpx;
					}

					.icon {
						width: 36rpx;
						height: 36rpx;
					}

					.right {
						width: 40rpx;
						height: 40rpx;
					}

				}
			}
		}

		.text-blue {
			color: #0081ff;
		}

		.margin-0 {
			margin-left: 0 !important;
		}

		.avatar {
			width: 100%;
			height: 100%;
			background-size: 100%;
		}
	}
</style>