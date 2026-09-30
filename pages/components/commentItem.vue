<template>
	<view class="info-tyle-commentltem">
		<!-- <view class="cu-item"> -->
		<view>
			<view class="cu-list menu-avatar comment">
				<view class="cu-item">
					<view class="cu-avatar round" @tap="toUserContents(item)" :style="item.style"></view>
					<text class="copy-comment" v-if="item.istop&&isContent">
						置顶
					</text>
					<text class="floor-nomber" v-else-if="isContent">
						{{floorNunber}}楼
					</text>
					<view class="content">
						<view class="text-grey">
							<block v-if="item.isvip>0">
								<block v-if="item.isvip==1">
									<text class="content-author-name tn-text-red" style="color: #f2ad5c;">
										{{item.author}}
									</text>
								</block>
								<block v-else>
									<text class="content-author-name text-red" style="color: #e6216d;">
										{{item.author}}
									</text>
								</block>
							</block>
							<block v-else>
								<text :style="{color:item.screenNamecolor}">
									{{item.author}}
								</text>

							</block>

							<block v-if="isHead">
								<text class="group louzhu" v-if="item.authorId==item.ownerId">楼主</text>
								<!--  #ifdef H5 || APP-PLUS -->
								<text class="userlv"
									:style="getLvStyle(item.experience)">{{getLv(item.experience)}}</text>
								<!-- <text class="userlv" :style="getUserLvStyle(item.lv)">{{getUserLv(item.lv)}}</text> -->

								<!--  #endif -->
								<text class="group customize adm" v-if="item.group=='administrator'">管理员
								</text>
								<text class="group customize" v-if="item.group=='editor'">编辑
								</text>
								<text class="group" :style="{backgroundColor:item.customizecolor}"
									v-if="item.customize&&item.customize!=''">{{item.customize}}</text>
							</block>
						</view>

						<view class="text-content text-df break-all" @tap="showCommentActions(item)">
							<rich-text :nodes="markHtml(item.text)"></rich-text>
						</view>
						<block>
							<view class="grid flex-sub col-3 grid-square" v-if="item.picList.length>0">
								<view class="bg-img" :style="'background-image:url('+data+');'"
									v-for="(data,i) in item.picList" :key="i" @tap="previewImage(item.picList,data)">
								</view>
							</view>
						</block>
						<view class="bg-grey light padding-sm radius margin-top-sm  text-sm"
							v-if="item.parent>0&&isContent">
							<view class="flex">
								<view v-if="item.parentComments.author">{{item.parentComments.author}}：</view>
								<view class="flex-sub break-all"><rich-text
										:nodes="markHtml(item.parentComments.text)"></rich-text></view>
							</view>
							<block>
								<view class="grid flex-sub col-3 grid-square" v-if="item.picList2.length>0">
									<view class="bg-img" :style="'background-image:url('+data+');'"
										v-for="(data,i) in item.picList2" :key="i"
										@tap="previewImage(item.picList2,data)">
									</view>
								</view>
							</block>
						</view>

						<view class="bg-grey light padding-sm radius margin-top-sm  text-sm" v-if="!isContent">
							<view class="flex" @tap="toInfo(item.cid,item.contenTitle)">
								<view class="break-all">{{replaceSpecialChar(item.contenTitle)}}</view>

							</view>
						</view>
						<view class="margin-top-sm flex justify-between">
							<view class="text-gray text-df">{{formatDate(item.created)}}</view>
							<view class="flex justify-between">
								<view>
									<!-- <text class="tn-icon-praise text-blue  margin-left-sm" @tap="commentstoLikes(item.coid)" v-if="item.isLike==1"></text> -->
									<!-- <text class="tn-icon-praise margin-left-sm" @tap="commentstoLikes(item.coid)" v-else></text> -->
								</view>
								<!-- <text class="cuIcon-praise text-blue" @tap="commentsAdd(item.author+'：'+item.text,item.coid,1,item.cid)" v-if="item.likes>0">{{item.likes}}</text> -->

								<text class="cuIcon-comment  margin-left-sm"
									@tap="commentsAdd(item.author+'：'+item.text,item.coid,1,item.cid)"></text>
							</view>
						</view>
						<!-- <view class="manage-btnb">
							<block v-if="group=='administrator'||group=='editor'&&isContent">
								<text class="text-blue radius" @tap="toBan(item.authorId)">封禁</text>
								<text class="text-red radius" @tap="toDelete(item.coid)">删除</text>
							</block>
							<block class="comment-operation" v-if="aid==uid||group=='administrator'&&isContent">
								<text class="text-green radius" v-if="item.istop==0"
									@tap="commentsTop(item.coid)">置顶</text>
								<text class="text-grey radius" v-else-if="item.istop==1"
									@tap="commentsrmTop(item.coid)">取消置顶</text>
							</block>
							
						</view> -->
						
					</view>
				</view>
			</view>
			
		</view>
	</view>

</template>

<script>
	import {
		localStorage
	} from '../../js_sdk/mp-storage/mp-storage/index.js'
	// #ifdef APP-PLUS
	import owo from '../../static/app-plus/owo/OwO.js'
	// #endif
	// #ifdef H5
	import owo from '../../static/h5/owo/OwO.js'
	import text from '../../uni_modules/uview-ui/libs/config/props/text.js';
	// #endif
	// #ifdef MP
	var owo = [];
	// #endif
	export default {
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
			isHead: {
				type: Boolean,
				default: true
			},
			isContent: {
				type: Boolean,
				default: false
			},
			aid: {
				type: Number,
				default: 0
			},
			// istop:{
			// 	type: Number,
			// 	default: 0
			// },
			floorNunber: {
				type: Number,
				default: 0
			}
		},
		name: "commentItem",
		data() {
			return {
				showOperation: true,
				owo: owo,
				owoList: [],
				uid: "",
				group: ""
			};
		},
		created() {
			var that = this;
			if (localStorage.getItem('userinfo')) {

				var userInfo = JSON.parse(localStorage.getItem('userinfo'));

				that.group = userInfo.group;
				that.uid = userInfo.uid;
			}

			// #ifdef APP-PLUS || H5
			var owo = that.owo.data;
			var owoList = [];
			for (var i in owo) {
				owoList = owoList.concat(owo[i].container);
			}
			that.owoList = owoList;
			// #endif

		},

		methods: {
			// 显示动态操作菜单（传入完整评论对象）
			showCommentActions(item) {
				var that = this;
				// 基础操作项
				let itemList = []
				let actions = []
				// 所有用户可见
				itemList.push('回复', '复制')
				actions.push('commentsAdd', 'tocopy')
				// 管理员或编辑操作
				if (that.group == 'administrator' || that.group == 'editor' &&that.isContent) {
					itemList.push('封禁', '删除')
					actions.push('ban', 'delete')
				}
				// 置顶权限：管理员 或 自己的文章
				if (that.group == 'administrator' || that.aid == that.uid && that.isContent) {
					if (item.istop == 0) {
						itemList.push('置顶')
						actions.push('top')
					} else if (item.istop == 1) {
						itemList.push('取消置顶')
						actions.push('rmtop')
					}
				}
				uni.showActionSheet({
					itemList,
					success: (res) => {
						const actionType = actions[res.tapIndex]
						switch (actionType) {
							case 'commentsAdd':
								that.commentsAdd(item.author + '：' + item.text, item.coid, 1, item.cid)
								break
							case 'ban':
								that.toBan(item.authorId)
								break
							case 'delete':
								this.toDelete(item.coid)
								break
							case 'top':
								this.commentsTop(item.coid)
								break
							case 'rmtop':
								this.commentsrmTop(item.coid)
								break
							case 'tocopy':
								this.ToCopy(item.text)
								break
						}
					}
				})
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
			toInfo(cid, title) {
				var that = this;

				uni.navigateTo({
					url: '/pages/contents/info?cid=' + cid + "&title=" + title
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
			toUserContents(data) {
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
			getUserLv(i) {
				var that = this;
				if (!i) {
					var i = 0;
				}
				var rankList = that.$API.GetRankList();
				return rankList[i];
			},

			getUserLvStyle(i) {
				var that = this;
				if (!i) {
					var i = 0;
				}
				var rankStyle = that.$API.GetRankStyle();
				var userlvStyle = "color:#fff;background-color: " + rankStyle[i];
				return userlvStyle;
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
			commentsAdd(title, coid, reply, cid) {
				var that = this;
				uni.navigateTo({
					url: '/pages/contents/commentsadd?cid=' + cid + "&coid=" + coid + "&title=" + title +
						"&isreply=" + reply
				});
			},
			commentstoLikes(id) {
				var that = this;
				var token = "";
				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;
				}
				var data = {
					"token": token,
					"id": id,
				}
				uni.showLoading({
					title: "加载中"
				});
				that.$Net.request({
					url: that.$API.commentsLikes(),
					data: {
						"params": JSON.stringify(that.$API.removeObjectEmptyKey(data)),
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
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						})

						if (res.data.code == 1) {

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
			markHtml(text) {
				var that = this;
				text = that.replaceAll(text, "<", "&lt;");
				text = that.replaceAll(text, ">", "&gt;");
				var owoList = that.owoList;
				// console.log(JSON.stringify(owoList));
				for (var i in owoList) {

					if (that.replaceSpecialChar(text).indexOf(owoList[i].data) != -1) {
						text = that.replaceAll(that.replaceSpecialChar(text), owoList[i].data, "<img src='/" + owoList[i]
							.icon + "' class='tImg' />")

					}
				}
				return text;
			},
			replaceAll(string, search, replace) {
				return string.split(search).join(replace);
			},
			toBan(uid) {
				if (!uid) {
					uni.showToast({
						title: "该用户不存在",
						icon: 'none'
					})
					return false;
				}
				uni.navigateTo({
					url: '/pages/manage/banuser?uid=' + uid
				});
			},
			toDelete(id) {
				var that = this;
				var token = "";

				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;
				}
				var data = {
					"key": id,
					"token": token
				}
				uni.showModal({
					title: '确定要删除该评论吗',
					success: function(res) {
						if (res.confirm) {
							uni.showLoading({
								title: "加载中"
							});

							that.$Net.request({
								url: that.$API.commentsDelete(),
								data: data,
								header: {
									'Content-Type': 'application/x-www-form-urlencoded'
								},
								method: "get",
								dataType: 'json',
								success: function(res) {
									setTimeout(function() {
										uni.hideLoading();
									}, 1000);
									uni.showToast({
										title: res.data.msg,
										icon: 'none'
									})

								},
								fail: function(res) {
									setTimeout(function() {
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
			commentsTop(id) {
				var that = this;
				var token = "";

				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;
				}
				var data = {
					"key": id,
					"istop": 1,
					"token": token
				}
				uni.showModal({
					title: '确定要置顶该评论吗',

					success: function(res) {
						if (res.confirm) {
							uni.showLoading({
								title: "加载中"
							});

							that.$Net.request({
								url: that.$API.commentsTop(),
								data: data,
								header: {
									'Content-Type': 'application/x-www-form-urlencoded'
								},
								method: "post",
								dataType: 'json',
								success: function(res) {
									setTimeout(function() {
										uni.hideLoading();
									}, 1000);
									uni.showToast({
										title: res.data.msg,
										icon: 'none'
									})


								},
								fail: function(res) {
									setTimeout(function() {
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
			commentsrmTop(id) {
				var that = this;
				var token = "";

				if (localStorage.getItem('userinfo')) {
					var userInfo = JSON.parse(localStorage.getItem('userinfo'));
					token = userInfo.token;
				}
				var data = {
					"key": id,
					"istop": 0,
					"token": token
				}
				uni.showModal({
					title: '确定要取消置顶该评论吗',

					success: function(res) {
						if (res.confirm) {
							uni.showLoading({
								title: "加载中"
							});

							that.$Net.request({
								url: that.$API.commentsTop(),
								data: data,
								header: {
									'Content-Type': 'application/x-www-form-urlencoded'
								},
								method: "post",
								dataType: 'json',
								success: function(res) {
									setTimeout(function() {
										uni.hideLoading();
									}, 1000);
									uni.showToast({
										title: res.data.msg,
										icon: 'none'
									})


								},
								fail: function(res) {
									setTimeout(function() {
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
			ToCopy(text) {
				var that = this;
				// #ifdef APP-PLUS
				uni.setClipboardData({
					data: text,
					success: () => { //复制成功的回调函数
						uni.showToast({ //提示
							title: "复制成功"
						})
					}
				});
				// #endif
				// #ifdef H5 
				let textarea = document.createElement("textarea");
				textarea.value = text;
				textarea.readOnly = "readOnly";
				document.body.appendChild(textarea);
				textarea.select();
				textarea.setSelectionRange(0, text.length);
				uni.showToast({ //提示
					title: "复制成功"
				})
				var result = document.execCommand("copy")
				textarea.remove();

				// #endif
			},
		}
	}
</script>

<style>

</style>