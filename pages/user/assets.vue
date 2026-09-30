<template>
	<view class="user">
		
		
		<view class="header" :style="[{height:CustomBar + 'px'}]" :class="AppStyle">
			<view class="cu-bar bg-white" :style="{'height': CustomBar + 'px','padding-top':StatusBar + 'px'}">
				<view class="action" @tap="back">
					<text class="cuIcon-back"></text>
				</view>
				<view class="content text-bold" :style="[{top:StatusBar + 'px'}]">
					我的账户
				</view>
				<view class="action">
				</view>
			</view>
		</view>
		<view :style="[{padding:NavBar + 'px 10px 0px 10px'}]"></view>
		<view class="data-box">
			<view class="myAssets">
				<text class="text-red myAssets-num">{{assets}}</text>{{currencyName}}
			</view>
			<view class="myAssets-btn">
				<text class="cu-btn bg-blue radius" @tap="userrecharge">充值</text>
				<text class="cu-btn bg-red radius" @tap="userwithdraw">提现</text>
				<text class="cu-btn bg-yellow radius cuIcon-videofill" v-if="adpid!=''" @tap="show">获取</text>
			</view>
			<view class="vip-maim" v-if="isvip==1">
				<view class="bg-gradual-red text-center shadow-blur">
					<view class="text-lg text-bold">欢迎您，尊贵的VIP用户</view>
					<view class="margin-top-sm text-Abc">正在享受全站商品{{tovipDiscount(vipDiscount)}}折优惠，及VIP专属头衔！</view>
					<view class="margin-top-sm text-Abc" v-if="vip==1">到期时间：永久</view>
					<view class="margin-top-sm text-Abc" v-else>到期时间：{{formatDate(vip)}}</view>
					<view class="cu-btn radius margin-top bg-black  shadow-blur" @click="showVip = true">立即续期</view>
				</view>
				
			</view>
			<view class="vip-maim" v-else>
				<view class="bg-gradual-blue text-center shadow-blur">
					<view class="text-lg text-bold">您当前不是VIP用户</view>
					<view class="margin-top-sm text-Abc">开通VIP，可享受全站商品{{tovipDiscount(vipDiscount)}}折优惠<text class="cuIcon-question"  @tap="showModal" data-target="DialogModal1"></text></view>
					<!-- <view class="cu-btn radius margin-top bg-yellow  shadow-blur" @tap="buyvip">立即开通</view> -->
					<view class="cu-btn radius margin-top bg-yellow  shadow-blur" @click="showVip = true">立即开通</view>
				</view>
			</view>
		</view>
		<view class="text-tips margin-top text-center text-gray text-sm">
			只显示最近30条资产记录
		</view>
		
		<view class="no-data" v-if="orderList.length==0">
			<text class="cuIcon-text"></text>暂时没有数据
		</view>
		<view class="order-box"  v-for="(item,index) in orderList" :key="index">
			<view class="order-main">
				<view class="order-info">
					<text class="order-id">订单ID：{{item.outTradeNo}}</text>
					<text class="order-type bg-blue" v-if="item.shopInfo">{{getType(item.shopInfo.type)}}</text>
				</view>
				<view class="order-shop">
					{{item.subject}}
					<view class="order-time">{{formatDate(item.created)}}</view>
				</view>
				<view class="order-btn">
					<text class="text-red">{{item.totalAmount}}{{currencyName}}</text>
					<text class="text-yellow pay-status" v-if="item.status==0">未支付</text>
					<text class="text-green pay-status" v-if="item.status==1">已支付</text>
				</view>
			</view>
		</view>
		<!--加载遮罩-->
		<view class="loading" v-if="isLoading==0">
			<view class="loading-main">
				<image src="../../static/loading.gif"></image>
			</view>
		</view>
		<!--加载遮罩结束-->
		<view class="cu-modal" :class="modalName=='DialogModal1'?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">VIP开通说明</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding-xl text-left">
					<view>开通VIP后，在有效期结束之前，您将享受全站所有商品（无论类型）的对应折扣优惠。但因为商品采用积分结算，而积分仅能为整数，所以在进行折扣计算时，将默认已整数结果进行计算。所以，对于VIP用户，小于或等于1积分的商品，将视为免费。价格大于1的商品，将省略小数点后部分。</view>
				</view>
			</view>
		</view>
		<u-popup round="10" :show="showVip" @close="showVip = false;" closeable>
			<view style="padding: 30rpx;">
				<view style="text-align: center;">
					<text>选择会员套餐</text> 
				</view>
				<u-grid col="3">
					<u-grid-item v-for="(item,index) in vipPackage" :key="index">
						<view class="package" @click="vipSelect = item"
							:style="{background:vipSelect && vipSelect.name == item.name?'#88d8c05e':''}">
							<view class="package-sub"
								style="display: flex;flex-direction: column;justify-content: center;align-items: center;">
								<text style="font-size: 26rpx;">{{item.day===0?'Day':'Day'}}</text>
								<text style="font-size: 50rpx;">{{item.day===0?'永久':item.day}}</text>
							</view>
							<view style="color: #999;text-align: center;font-size: 24rpx;">
								<text>{{item.price}}</text>
								<text class="text-red">{{currencyName}}</text>
							</view>
							
						</view>
						
					</u-grid-item>
					
				</u-grid>
				<view style="margin-top: 20rpx;">
					<u-button color="#88d8c0" shape="circle"
						@click="vipSelect.name?toBuyVip(vipSelect.card):$u.toast('你还没有选择会员套餐~')">开通{{vipSelect.name}}VIP</u-button>
				</view>
			</view>
		</u-popup>
	</view>
	
</template>

<script>
	const ERROR_CODE = [-5001, -5002, -5003, -5004, -5005, -5006];
	import waves from '@/components/xxley-waves/waves.vue';
	import { localStorage } from '../../js_sdk/mp-storage/mp-storage/index.js'
	export default {
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				NavBar:this.StatusBar +  this.CustomBar,
			AppStyle:this.$store.state.AppStyle,
				
				
				userInfo:null,
				token:"",
				assets:"",
				isvip:0,
				vip:0,
				
				vipDay:0,
				showVip: false,
				vipPackage: [],
				vipSelect: {},
				
				orderList:[],
				
				isLoading:0,
				
				modalName: null,
				
				vipDiscount:0,
				vipPrice:0,
				scale:0,
				currencyName:"",
				
				title: '激励视频广告',
				loading: false,
				loadError: false,
				adpid:'',
				adsLogid:''
				
			}
		},
		onPullDownRefresh(){
			var that = this;
			if(localStorage.getItem('token')){
				
				that.token = localStorage.getItem('token');
				that.userStatus();
				that.getOrderList();
			}
			that.getVipInfo();
			var timer = setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000)
		},
		onReady() {
		    // #ifdef APP-PLUS
			this.adpid = this.$API.GetAdpid();
			
			if(this.adpid!=""){
				this.adOption = {
				    adpid: this.adpid
				};
				this.createAd();
			}
		    
		    // #endif
		},
		onShow(){
			var that = this;
			that.currencyName = that.$API.getCurrencyName();
			// #ifdef APP-PLUS
			
			plus.navigator.setStatusBarStyle("dark")
			
			// #endif
			that.getVipInfo();
			if(localStorage.getItem('userinfo')){
				
				that.userInfo = JSON.parse(localStorage.getItem('userinfo'));
				that.userInfo.style = "background-image:url("+that.userInfo.avatar+");"
			}
			if(localStorage.getItem('token')){
				
				that.token = localStorage.getItem('token');
				that.userStatus();
				that.getOrderList();
			}
			
		},
		onLoad() {
			var that = this;
			// #ifdef APP-PLUS || MP
			that.NavBar = this.CustomBar;
			// #endif
			this.getVipPackage();
		},
		mounted() {
		this.getleiji()
		},
		methods: {
			back(){
				uni.navigateBack({
					delta: 1
				});
			},
			showModal(e) {
				this.modalName = e.currentTarget.dataset.target
			},
			hideModal(e) {
				this.modalName = null
			},
			toLink(text){
				var that = this;
				
				if(!localStorage.getItem('token')||localStorage.getItem('token')==""){
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
			userrecharge(){
				var that = this;
				uni.navigateTo({
				    url: '/pages/user/userrecharge'
				});
				
			},
			userwithdraw(){
				uni.navigateTo({
				    url: '/pages/user/userwithdraw'
				});
			},
			// buyvip(){
			// 	uni.navigateTo({
			// 	    url: '/pages/user/buyvip'
			// 	});
			// },
			getVipInfo(){
				var that = this;
				that.$Net.request({
					url: that.$API.getVipInfo(),
					header:{
						'Content-Type':'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if(res.data.code==1){
							that.vipDiscount=res.data.data.vipDiscount;
							that.vipPrice=res.data.data.vipPrice;
							that.scale=res.data.data.scale;
							that.vipDay = res.data.data.vipDay;
						}
						var timer = setTimeout(function() {
							that.isLoading=1;
							clearTimeout('timer')
						}, 300)
					},
					fail: function(res) {
						var timer = setTimeout(function() {
							that.isLoading=1;
							clearTimeout('timer')
						}, 300)
					}
				})
			},
			getVipPackage(){
				var that = this;
				that.$Net.request({
					url: that.$API.vipTypeListStar(),
					header:{
						'Content-Type':'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if(res.data.code==1){
							var list = res.data.data || [];
							that.vipPackage = list.map(function(item){
								return {
									name: item.name,
									day: item.permanent === 1 ? 0 : (item.days || 0),
									card: item.key,
									price: item.price || 0,
									enable: item.enable
								};
							}).filter(function(item){
								return item.enable == 1;
							});
							if(that.vipPackage.length > 0){
								that.vipSelect = that.vipPackage[0];
							}
						}
					},
					fail: function(res) {}
				})
			},
			toBuyVip(card){
				var that = this;
				var token = "";
				that.showVip=false;
				if(!card){
					uni.showToast({
					    title:"请选择套餐",
						icon:'none',
						duration: 1000,
						position:'bottom',
					});
					return;
				}
				if(localStorage.getItem('userinfo')){
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token=userInfo.token;
				}else{
					uni.showToast({
					    title:"请先登录",
						icon:'none',
						duration: 1000,
						position:'bottom',
					});
				}
				var data = {
					"card":card,
					"token":token
				}
				uni.showModal({
					
					title: '确定要购买该套餐吗',
					success: function (res) {
						if (res.confirm) {
							uni.showLoading({
								title: "加载中"
							});
							
							that.$Net.request({
								url: that.$API.buyVIP(),
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
										
										var timer = setTimeout(function() {
											that.back();
											clearTimeout('timer')
										}, 1000)
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
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
				
				
			},
			userStatus() {
				var that = this;
				that.$Net.request({
					
					url: that.$API.userStatus(),
					data:{
						"token":that.token
					},
					header:{
						'Content-Type':'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						if(res.data.code==1){
							that.assets = res.data.data.assets;
							that.vip = res.data.data.vip;
							that.isvip = res.data.data.isvip;
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
			getOrderList(){
				var that = this;
				var data = {
					"token":that.token
				}
				that.$Net.request({
					url: that.$API.payLogList(),
					data:data,
					header:{
						'Content-Type':'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						uni.stopPullDownRefresh()
						if(res.data.code==1){
							var list = res.data.data;
							if(list.length>0){
							
								that.orderList = list;
								
							}
						}
						var timer = setTimeout(function() {
							that.isLoading=1;
							clearTimeout('timer')
						}, 300)
					},
					fail: function(res) {
						uni.stopPullDownRefresh()
						uni.showToast({
							title: "网络开小差了哦",
							icon: 'none'
						})
						var timer = setTimeout(function() {
							that.isLoading=1;
							clearTimeout('timer')
						}, 300)
					}
				})
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
			
			tovipDiscount(num){
				if(Number(num)<=0){
					return 0;
				}else{
					num = num.toString();
					num = num.replace("0.","");
					return num;
				}
				
			},
			getleiji() {
			  // FAST_URL(sb.520771.xyz) 已移除
			},
			//激励视频
			createAd() {
				var that = this;
			    var rewardedVideoAd = this.rewardedVideoAd = uni.createRewardedVideoAd(this.adOption);
			    rewardedVideoAd.onLoad(() => {
			        this.loading = false;
			        this.loadError = false;
			        console.log('onLoad event')
			    });
			    rewardedVideoAd.onClose((res) => {
			        this.loading = true;
			        // 用户点击了【关闭广告】按钮
			        if (res && res.isEnded) {
			            // 正常播放结束
			            console.log("onClose " + res.isEnded);
						console.log("开始广告")
						that.adsGiftNotify();
			        } else {
			            // 播放中途退出
			            console.log("onClose " + res.isEnded);
						setTimeout(() => {
						    uni.showToast({
						        title: "您未完成广告播放，无法获得奖励！",
						        duration: 10000,
						        position: 'bottom'
						    })
						}, 500)
			        }
					uni.hideLoading();
			        
			    });
			    rewardedVideoAd.onError((err) => {
					uni.hideLoading();
			        this.loading = false;
			        if (err.code && ERROR_CODE.indexOf(err.code) !== -1) {
			            this.loadError = true;
			        }
			        console.log('onError event', err)
					uni.showToast({
					    title: err.errMsg,
					    duration: 10000,
					    position: 'bottom'
					})
			    });
			    this.loading = true;
			},
			show() {
				var that = this;
				uni.showLoading();
				that.$Net.request({
					
					url: that.$API.adsGift(),
					data:{
						"token":that.token,
						"appkey":that.$API.getAppKey()
					},
					header:{
						'Content-Type':'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						console.log(JSON.stringify(res));
						
						uni.hideLoading();
						if(res.data.code==1){
							that.adsLogid = res.data.data.logid;
							const rewardedVideoAd = that.rewardedVideoAd;
							rewardedVideoAd.show().catch(() => {
							    rewardedVideoAd.load()
							        .then(() => rewardedVideoAd.show())
							        .catch(err => {
							            console.log('激励视频 广告显示失败', err)
							            uni.showToast({
							                title: err.errMsg || err.message,
							                duration: 5000,
							                position: 'bottom'
							            })
							        })
							})
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
			adsGiftNotify(){
				var that = this;

				that.$Net.request({
					
					url: that.$API.adsGiftNotify(),
					data:{
						"token":that.token,
						"logid":that.adsLogid
					},
					header:{
						'Content-Type':'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						console.log(JSON.stringify(res));
						if(res.data.code==1){
							uni.showToast({
							    title: "已获得"+res.data.data.award+that.currencyName+"奖励",
							    duration: 3000,
							    position: 'bottom'
							})
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
			reloadAd() {
			    this.loading = true;
			    this.rewardedVideoAd.load();
			}
		},
		components: {
			waves
		}
	}
</script>

<style>
	
	.package {
		display: flex;
		flex-direction: column;
		padding: 30rpx;
		height: 220rpx;
		border: $c-primary solid 2rpx;
		width: 220rpx;
		margin: 0rpx;
		border-radius: 20rpx;
		
		&-sub {
			color: $c-primary;
			display: flex;
			justify-content: center;
			align-items: baseline;
		}
	}
	
</style>
