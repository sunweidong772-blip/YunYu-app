<template>
	<view class="user" :class="$store.state.AppStyle">
		<view class="header" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar bg-white" :style="{'height': CustomBar + 'px','padding-top':StatusBar + 'px'}">
				<view class="action" @tap="back">
					<text class="cuIcon-back"></text>
				</view>
				<view class="content text-bold" :style="[{top:StatusBar + 'px'}]">
					版主列表
				</view>
				<view class="action">
					
				</view>
			</view>
		</view>
		<view :style="[{padding:NavBar + 'px 10px 0px 10px'}]"></view>
		
		<view class="cu-list menu-avatar userList" style="margin-top: 20upx;">
			<view class="no-data" v-if="moderators.length==0">
				<text class="cuIcon-text"></text>暂时没有数据
			</view>
			<view class="cu-item" v-for="(item,index) in moderators" :key="index" @tap="toUserContents(item.userJson)">
				<view class="cu-avatar round lg" :style="item.userJson.avatar"></view>
				<view class="content">
					
					<view class="text-grey">
						<block v-if="item.userJson.isvip > 0">
							<text v-if="item.userJson.isvip==1" class="content-author-name tn-text-bold"
								style="color: #f2ad5c;" @tap="toUser(item)">{{item.userJson.name}}</text>
							<text v-if="item.userJson.isvip==2" class="content-author-name text-bold"
								style="color: #e6216d;" @tap="toUser(item)">{{item.userJson.name}}</text>
							<!-- <text class="userlv" v-if="item.userJson.isvip==1"
									style="background: linear-gradient(to bottom right, #f2ad5c, #e6216d,#901ccb);color:white;padding: 3px 5px;border-radius: 10px;">
									VIP
								</text> -->
						</block>
						<block v-else>
							<text class="content-author-name " :style="{color:item.userJson.screenNamecolor}"
								@tap="toUser(item)">{{item.userJson.name}}</text>
						</block>
						<!-- <block>{{item.userJson.name}}</block> -->
						<!-- <text v-if="item.userJson.groupKey=='contributor'||item.userJson.groupKey=='administrator'" class="cuIcon-lightfill"></text> -->
						
						<!--  #ifdef H5 || APP-PLUS -->
						<text class="userlv"
							:style="getLvStyle(item.userJson.experience)">{{getLv(item.userJson.experience)}}
						</text>
						<text class="group customize adm" v-if="item.userJson.group=='administrator'">
							管理员
						</text>
						<text class="group customize" v-if="item.userJson.group=='editor'">
							版主
						</text>
						<text class="group purview" v-if="item.purview">
							  {{getRestrictList(item.purview-1).name}}
						</text>
						<text class="group" :style="{backgroundColor:item.userJson.customizecolor}"
							v-if="item.userJson.customize&&item.userJson.customize!=''">
							{{item.userJson.customize}}
						</text>
						<block v-if="item.userJson.isvip>0">
							<block v-if="item.userJson.vip==1">
								<text class="isVIP bg-gradual-red">VIP</text>
							</block>
							<block v-else>
								<text class="isVIP bg-yellow">VIP</text>
							</block>
						</block>
						<!--  #endif -->
					</view>
					<view class="text-gray text-sm flex">
						<view class="text-cut" v-if="item.purview">
							<!-- {{subText(item.userJson.introduce,100)}} -->
							{{getRestrictList(item.purview-1).name}}
						</view>
					</view>
					
				</view>
				<view class="action goUserIndex">
					<view class="cu-btn bg-gradual-red">主页</view>
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
	</view>
</template>

<script>
	import { localStorage } from '../../js_sdk/mp-storage/mp-storage/index.js'
	export default {
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				NavBar:this.StatusBar +  this.CustomBar,
				// AppStyle:this.$store.state.AppStyle,
				
				moderators:[],
				isLoad:0,
				isLoading:0,
				id:0,
				
			}
		},
		onPullDownRefresh(){
			var that = this;
			that.page=1;
			that.getUserList(false);
			setTimeout(function () {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onReachBottom() {
		    //触底后执行的方法，比如无限加载之类的
			var that = this;
			if(that.isLoad==0){
				that.loadMore();
			}
		},
		onShow(){
			var that = this;
			that.page=1;
			// #ifdef APP-PLUS
			
			//plus.navigator.setStatusBarStyle("dark")
			// #endif
			
		},
		onLoad(res) {
			var that = this;
			// #ifdef APP-PLUS || MP
			that.NavBar = this.CustomBar;
			// #endif
			if(res.id){
				that.id = res.id;
				that.getSectionInfo();
			}
			
		},
		methods:{
			back(){
				uni.navigateBack({
					delta: 1
				});
			},
			getRestrictList(i) {
				var that = this;
				if (!i) {
					var i = 0;
				}
				var restrictList = that.$API.GetRestrictList();
				return restrictList[i];
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
						that.isLoad = 1;
						that.isLoading = 1;
						if(res.data.code==1){
							that.moderators = res.data.data.moderators;
							console.log(JSON.stringify(res.data.data));
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
			toUserContents(data){
				var that = this;
				var name = data.name;
				var title = data.name+"的信息";
				if(data.screenName){
					title = data.screenName+" 的信息";
					name = data.screenName
				}
				var id= data.uid;
				var type="user";
				uni.navigateTo({
				    url: '/pages/contents/userinfo?title='+title+"&name="+name+"&uid="+id+"&avatar="+encodeURIComponent(data.avatar)
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
			subText(text,num){
				if(text){
					if(text.length>num){
						text = text.substring(0,num);
						return text+"……";
					}else{
						return text;
					}
				}else{
					return "Ta还没有个人介绍哦"
				}
			}
		}
	}
	
</script>

<style>
</style>
