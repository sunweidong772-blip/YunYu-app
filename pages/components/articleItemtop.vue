<template>
	<view>
		<view class=" cu-card articleb no-card " @tap="toInfo(item)">
			<view class="cu-item shadow">
				<view class="toptitle">
					<view class="text-cut">
						<text class="hot-top margin-right-sm" style="background-color: #000000;" v-if="item.title.includes('官方')">官方</text>
						<text class="hot-top margin-right-xs" style="background-color: #ff0000;" v-else-if="item.title.includes('公告')">公告</text>
						<text class="hot-top margin-right-sm" style="background-color: #ff6ef8;" v-else-if="item.title.includes('活动')">活动</text>
						<text class="hot-top margin-right-sm" style="background-color: #ffa73a;" v-else="isTop">置顶</text>
						
						<text style="color: #000000;">{{replaceSpecialChar(item.title)}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			item: {
				type: Object,
				default: () => ({})
			},
			isTop: {
				type: Boolean,
				default: false
			}
		},
		name: "articleItemtop",
		data() {
			return {};
		},
		methods: {
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

		}
	}
</script>

<style>
/* 基础样式重置 */
/* * {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
} */

/* 置顶标签样式 */
.hot-top {
	font-size: 22upx;
	line-height: 25upx;
	padding: 4upx 10upx;
	border-radius: 8upx;
	margin-left: 10upx;
	margin-top: -4upx;
	color: #ffffff;
	/* 增加右侧间距 */
	margin-left: 15upx;
	vertical-align: middle;
	/* 垂直居中对齐 */ 
}

/* 文章卡片基础样式 */
.cu-card,
.cu-cardb {
	/* border: 0upx solid #e0e0e0; */
	border-radius: 3upx;
	margin-bottom: 3upx;
	background-color: white;
	overflow: hidden;
}

/* 文章标题部分样式 */
.toptitle {
	padding: 10upx;
	margin-right: 13upx;
}
.text-cut {
	display: inline-block;
	vertical-align: middle;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	/* font-size: 25upx; */
	/* margin-right: 13upx; */
}
</style>