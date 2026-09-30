<template>
	<view class="userpost" :class="$store.state.AppStyle">
		<view class="header" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar bg-white" :style="{'height': CustomBar + 'px','padding-top':StatusBar + 'px'}">
				<view class="action" @tap="back">
					<text class="cuIcon-back"></text>
				</view>
				<view class="content text-bold" :style="[{top:StatusBar + 'px'}]">
					所有版块
				</view>
				<view class="action">
				</view>
			</view>
		</view>
		<view :style="[{padding:NavBar + 'px 10px 0px 10px'}]"></view>
		<view class="data-box" v-for="(item,index) in metaList" :key="index">
			<view class="cu-bar bg-white">
				<view class="action data-box-title">
					{{item.name}}
				</view>
			</view>
			<view class="section-page">
				<view class="section-page-box"  v-for="(data,j) in item.subList" :key="j" >
					<view class="section-ico">
						<image :src="data.pic" mode="aspectFill" v-if="data.pic&&data.pic!=''"></image>
						<view class="section-ico-no" v-else>
							<text class="cuIcon-discoverfill"></text>
						</view>
					</view>
					<view class="section-intro">
						<view class="section-item-tile">
							{{data.name}}
						</view>
						<view class="section-item-value">
							 帖子
						</view>
					</view>
					<view class="section-page-btn">
						
						
						<view class="cu-btn bg-blue" @tap="setCur(data)">
							选择
						</view>
						
					</view>
				</view>
			</view>
		</view>
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
			AppStyle:this.$store.state.AppStyle,
				
				metaList:[],
				searchText:"",
				submit:[],
				
				isLoading:0,
				
				type:"all",
				curNum:0,
				
			}
		},
		onPullDownRefresh(){
			var that = this;
			
		},
		onShow(){
			var that = this;
			// #ifdef APP-PLUS
			
			//plus.navigator.setStatusBarStyle("dark")
			// #endif
			
			
		},
		onLoad(res) {
			var that = this;
			// #ifdef APP-PLUS || MP
			that.NavBar = this.CustomBar;
			// #endif
			that.getMetaList();
			if(res.type){
				that.type = res.type;
			}
		},
		methods: {
			back(){
				uni.navigateBack({
					delta: 1
				});
			},
			setCur(data){
				var that = this;
				localStorage.setItem('curSection',JSON.stringify(data));
				that.back();
			},
			getMetaList(){
				var that = this;
				var data = {
					"type":"category"
				}
				that.$Net.request({
					url: that.$API.getMetasList(),
					data:{
						"searchParams":JSON.stringify(that.$API.removeObjectEmptyKey(data)),
						"limit":100,
						"page":1,
						"order":"order"
					},
					header:{
						'Content-Type':'application/x-www-form-urlencoded'
					},
					method: "get",
					dataType: 'json',
					success: function(res) {
						
						if(res.data.code==1){
							var list = res.data.data;
							if(list.length>0){

								var parentList = [];
								for(var i in list){
								  if(list[i].parent==0){
								    list[i].show = false;
									list[i].active = 0;
								    parentList.push(list[i]);
								  }
								}
								for(var o in parentList){
								  var subList = [];
								  for(var s in list){
								    if(list[s].parent==parentList[o].mid){
									  list[s].active = 0;
								      subList.push(list[s]);
								    }
								  }
								  parentList[o].subList = subList;
								}
								that.metaList = parentList;
								
								
								localStorage.setItem('find_metaList',JSON.stringify(that.metaList));
							}
						}
						var timer = setTimeout(function() {
							that.isLoading=1;
							clearTimeout('timer')
						}, 300)
					},
					fail: function(res) {
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
			toCategoryContents(data){
				var that = this;
				var title = data.name;
				var id = data.mid;
				if(that.type!="all"){
					var type="meta";
					uni.navigateTo({
					    url: '/pages/contents/contentlist?title='+title+"&type="+type+"&id="+id
					});
				}else{
					
					//清除所有的选中
					var oldMetaList = that.metaList;
					for(var i in oldMetaList){
						oldMetaList[i].active = 0;
						
						if(oldMetaList[i].subList.length>0){
							var subList =  oldMetaList[i].subList;
							for(var o in subList){
								subList[o].active = 0;
							}
							oldMetaList[i].subList = subList;
						}
					}
					that.metaList = oldMetaList;
					//判断是否为大类
					if(data.parent==0){
						var metaList = that.metaList;
						for(var i in metaList){
							if(metaList[i].mid==data.mid){
								//只有不存在任何小类的大类可以被直接选中
								if(data.subList.length==0){
									if(metaList[i].active==0){
										metaList[i].active=1;
									}
								}
							}
						}
						that.metaList = metaList;
					}else{
						//开始新选择小类
						var metaList = that.metaList;
						var parent = data.parent;
						
						for(var i in metaList){
							if(metaList[i].mid==parent){
								var subList =  metaList[i].subList;
								var isActive = 0;
								if(subList.length>0){
									//点击的是小类，则给小类添加选中状态
									for(var o in subList){
										if(subList[o].mid == data.mid){
											
											if(data.active == 0){
												subList[o].active = 1;
												isActive = 1;
											}
										}
										
									}
									metaList[i].subList = subList;
								}
								metaList[i].active = isActive;
							}
						}
						that.metaList = metaList;
					}
					
					
				}
				
			},
			submit(){
				var that = this;
				var clist ="";
				var list = that.metaList;
				console.log(list)
				for(var i in list){
					if(list[i].active==1){
						clist += ","+list[i].mid;
						if(list[i].subList.length>0){
							var subList =  list[i].subList;
							for(var o in subList){
								if(subList[o].active == 1){
									clist += ","+subList[o].mid;
								}
							}
						}
					}
				}
				// if(clist==""){
				// 	uni.showToast({
				// 		title: "请选择分类",
				// 		icon: 'none'
				// 	});
				// 	return false;
				// }
				localStorage.setItem('clist',clist);
				that.back();
				
			},

		}
	}
</script>

<style>
</style>
