<template>
	<view class="checkin-page" :class="tabIndex === 0 ? 'gold-bg' : 'blue-bg'">
		<view class="checkin-header">
			<u-navbar :fixed="true" :placeholder="true" :safeAreaInsetTop="true" :border="false"
				:bgColor="'transparent'">
				<view slot="left" class="hd-left" @click="goBack">
					<text class="cuIcon-back"></text>
				</view>
				<view slot="center" class="hd-center">
					<text class="hd-title">签到中心</text>
					<text class="hd-sub">{{ dateText }}</text>
				</view>
				<view slot="right" class="hd-right">
					<view v-if="signedToday" class="hd-badge">
						<text class="cuIcon-check"></text>
						<text>已签</text>
					</view>
					<view v-else-if="streak > 0" class="hd-badge">
						<text class="cuIcon-hot"></text>
						<text>{{ streak }}</text>
					</view>
				</view>
			</u-navbar>
		</view>

		<view class="tab-bar">
			<view v-for="(t, i) in tabs" :key="t" class="tab-item" :class="tabIndex === i ? 'on' : ''" @click="switchTab(i)">
				<text>{{ t }}</text>
				<view v-if="tabIndex === 0 && i === 0" class="tab-dot"></view>
			</view>
		</view>

		<view class="tab-body">
			<view v-if="!isLoggedIn" class="empty-box">
				<text class="cuIcon-lock empty-icon"></text>
				<text class="empty-text">请先登录</text>
				<view class="empty-btn" @click="recheckLogin"><text>重新检测登录</text></view>
			</view>

			<scroll-view v-else-if="tabIndex === 0" class="tab-scroll" scroll-y :refresher-enabled="true" :refresher-triggering="isRefreshing"
				@refresherrefresh="onRefreshHome">
				<view class="home-panel">
					<view v-if="isLoading && !signedToday && streak === 0 && monthSignCount === 0" class="skeleton-list">
						<view class="sk sk-hero"></view>
						<view class="sk sk-cal"></view>
						<view class="sk sk-reward"></view>
					</view>
					<block v-else>
						<view class="sign-hero">
							<view class="hero-row">
								<view class="hero-left">
									<view class="fire-chip">
										<text class="cuIcon-hot"></text>
										<text>连续签到</text>
									</view>
									<view class="streak-line">
										<text class="streak-num" :class="streak >= 30 ? 'gold' : ''">{{ streak }}</text>
										<text class="streak-unit">天</text>
									</view>
								</view>
								<view class="sign-btn" :class="signedToday ? 'done' : (isSigning ? 'busy' : '')" @click="doSign">
									<text v-if="isSigning">…</text>
									<block v-else-if="signedToday">
										<text class="cuIcon-check"></text>
										<text>今日已签到</text>
									</block>
									<block v-else>
										<text class="cuIcon-appreciate"></text>
										<text>立即签到</text>
									</block>
								</view>
							</view>
							<view class="chip-row">
								<view class="data-chip">
									<view class="chip-val"><text>{{ streak }}</text><text class="chip-u">天</text></view>
									<text class="chip-label">连击</text>
								</view>
								<view class="data-chip">
									<view class="chip-val"><text>{{ monthSignCount }}</text><text class="chip-u">天</text></view>
									<text class="chip-label">本月已签</text>
								</view>
								<view class="data-chip">
									<view class="chip-val"><text>{{ remainLottery }}</text><text class="chip-u">次</text></view>
									<text class="chip-label">抽奖剩余</text>
								</view>
							</view>
						</view>

						<view class="section-card">
							<view class="sec-head">
								<view class="sec-icon"><text class="cuIcon-calendar"></text></view>
								<text class="sec-title">本月签到日历</text>
							</view>
							<view v-if="makeupCardCount > 0" class="makeup-bar" :class="isMakeupMode ? 'on' : ''" @click="toggleMakeup">
								<text class="cuIcon-recharge"></text>
								<text class="mk-count">补签卡 ×{{ makeupCardCount }}</text>
								<view v-if="isMakeupMode" class="mk-pick" @click.stop="pickMakeupDate"><text>选择日期</text></view>
								<text class="mk-action">{{ isMakeupMode ? '退出补签' : '点击补签' }}</text>
							</view>
							<view class="cal-nav">
								<view class="cal-arrow" @click="shiftMonth(-1)"><text class="cuIcon-back"></text></view>
								<text class="cal-ym">{{ viewYear }}年{{ viewMonth }}月</text>
								<view class="cal-arrow" @click="shiftMonth(1)"><text class="cuIcon-right"></text></view>
								<view v-if="!viewingCurrentMonth" class="cal-today" @click="backToCurrentMonth"><text>回到本月</text></view>
							</view>
							<view class="cal-week">
								<text v-for="w in weekLabels" :key="w">{{ w }}</text>
							</view>
							<view class="cal-grid">
								<view v-for="(cell, i) in calendarCells" :key="i" class="cal-cell" :class="cellClass(cell)" @click="onDayTap(cell)">
									<text>{{ cell.day }}</text>
								</view>
							</view>
							<view v-if="isMakeupMode" class="mk-tip">
								<text>点浅色圆即可补签；跨月可用「选择日期」</text>
							</view>
						</view>

						<view v-if="sortedRewards.length" class="section-card">
							<view class="sec-head">
								<view class="sec-icon"><text class="cuIcon-present"></text></view>
								<text class="sec-title">连续签到奖励</text>
							</view>
							<view v-for="r in sortedRewards" :key="r.id" class="reward-item"
								:class="{ can: canClaim(r), claimed: r.claimed }">
								<view class="badge-circle" :class="badgeClass(r)">
									<text v-if="r.claimed" class="cuIcon-check"></text>
									<text v-else class="cuIcon-present"></text>
								</view>
								<view class="reward-mid">
									<text class="reward-days">连续 {{ r.days }} 天</text>
									<text class="reward-desc">{{ rewardDesc(r) }}</text>
									<text class="reward-prog" :class="streak >= r.days ? 'gold' : ''">{{ streak }}/{{ r.days }}</text>
								</view>
								<view v-if="r.claimed" class="reward-btn muted"><text>已领取</text></view>
								<view v-else-if="canClaim(r)" class="reward-btn act" @click="claimReward(r)">
									<text>{{ claimingIds[r.id] ? '…' : '领取' }}</text>
								</view>
								<view v-else class="reward-btn muted"><text>还差{{ r.days - streak }}天</text></view>
							</view>
						</view>

						<view v-if="lotteryPool.length" class="section-card lot-entry" :class="remainLottery > 0 ? '' : 'dim'" @click="openLottery">
							<view class="lot-dice"><text class="cuIcon-activity"></text></view>
							<view class="lot-mid">
								<text class="lot-title">签到抽奖</text>
								<text class="lot-sub">奖池 {{ lotteryPool.length }} 件</text>
								<view class="lot-badge" :class="remainLottery > 0 ? 'on' : ''">
									<text>剩余 {{ remainLottery }} 次机会</text>
								</view>
							</view>
							<text class="cuIcon-right lot-arrow"></text>
						</view>
						<view class="home-pad"></view>
					</block>
				</view>
			</scroll-view>

			<scroll-view v-else-if="tabIndex === 1" class="tab-scroll" scroll-y :refresher-enabled="true" :refresher-triggering="isRefreshingRank"
				@refresherrefresh="onRefreshRank">
				<view class="blue-panel">
					<view v-if="rankPeriod" class="period-pill"><text>{{ rankPeriod }} 月榜</text></view>
					<view v-if="isLoadingRank && !rankList.length" class="empty-box inline">
						<text class="empty-text">加载中…</text>
					</view>
					<view v-else-if="!rankList.length" class="empty-box inline">
						<text class="cuIcon-medal empty-icon"></text>
						<text class="empty-text">暂无排行榜数据</text>
					</view>
				<block v-else>
					<view v-for="(item, index) in rankList" :key="item.uid || index" class="rank-item"
						:class="{ me: item.isMe, champ: item.rank === 1 }">
						<view class="rank-no" :class="'r' + (item.rank <= 3 ? item.rank : 'n')">
							<view v-if="item.rank <= 3" class="rank-medal">
								<text class="cuIcon-crown"></text>
							</view>
							<text v-else>{{ item.rank }}</text>
						</view>
						<view class="rank-avatar-wrap" :class="item.isMe ? 'me' : ''">
							<image class="rank-avatar" :src="avatarOf(item)" mode="aspectFill"></image>
						</view>
						<view class="rank-name"><text>{{ nameOf(item) }}{{ item.isMe ? '（我）' : '' }}</text></view>
						<view class="rank-streak" :class="item.rank <= 3 ? 'top' : ''">
							<text class="cuIcon-hot"></text>
							<text>连签{{ item.streak }}天</text>
						</view>
					</view>
				</block>

					<view v-if="rankRewardGroups.length" class="section-card blue">
						<view class="sec-head">
							<view class="sec-icon blue"><text class="cuIcon-medal"></text></view>
							<text class="sec-title">排行榜奖励</text>
						</view>
						<view v-for="g in rankRewardGroups" :key="g.key" class="rr-row" :class="g.covered ? 'covered' : ''">
							<view class="rr-range"><text>{{ g.covered ? g.range + ' · 我' : g.range }}</text></view>
							<view class="rr-items">
								<view v-for="(it, ii) in g.items" :key="ii" class="rr-item">
									<text>{{ it }}</text>
								</view>
							</view>
						</view>
					</view>
					<view class="home-pad"></view>
				</view>
			</scroll-view>

			<scroll-view v-else class="tab-scroll" scroll-y :refresher-enabled="true" :refresher-triggering="isRefreshingDyn"
				@refresherrefresh="onRefreshDyn" @scrolltolower="loadMoreDynamic">
				<view class="blue-panel">
					<view v-if="isLoadingDynamic && !dynamicList.length" class="empty-box inline">
						<text class="empty-text">加载中…</text>
					</view>
					<view v-else-if="!dynamicList.length" class="empty-box inline">
						<text class="cuIcon-list empty-icon"></text>
						<text class="empty-text">暂无签到动态</text>
						<text class="empty-sub">今天开启你的连击吧</text>
					</view>
				<block v-else>
					<view v-for="(d, i) in dynamicList" :key="i" class="dyn-item"
						:class="d.type === 'lottery' ? 'is-lot' : ''">
						<view class="dyn-avatar-wrap" :class="d.type === 'lottery' ? 'gold' : ''">
							<image class="dyn-avatar" :src="d.avatar || defaultAvatar" mode="aspectFill"></image>
						</view>
						<view class="dyn-mid">
							<view class="dyn-line">
								<text class="dyn-name">{{ d.name }}</text>
								<text class="dyn-text" :class="d.type === 'lottery' ? 'blue' : ''">{{ d.text }}</text>
							</view>
							<view class="dyn-meta">
								<view class="dyn-tag" :class="d.type === 'lottery' ? 'lot' : ''">
									<text>{{ d.type === 'lottery' ? '抽奖' : '签到' }}</text>
								</view>
								<text class="cuIcon-time dyn-time-ico"></text>
								<text class="dyn-time">{{ formatRelative(d.created) }}</text>
							</view>
						</view>
					</view>
					<view v-if="isLoadingMoreDynamic" class="load-more"><text>加载中…</text></view>
					<view v-else-if="!hasMoreDynamic" class="load-more"><text>没有更多了</text></view>
					<view v-else class="load-more" @click="loadMoreDynamic"><text>上拉加载更多</text></view>
				</block>
					<view class="home-pad"></view>
				</view>
			</scroll-view>

				<view v-if="tabIndex === 1 && isLoggedIn" class="my-rank-bar">
				<view class="mrb-label"><text>我的排名</text></view>
				<view class="mrb-rank">
					<template v-if="myRank.rank != null">
						<text class="mrb-num gold-text">{{ myRank.rank }}</text>
						<text class="mrb-unit">名</text>
					</template>
					<text v-else class="mrb-none">{{ myRank.boardLimit != null && myRank.streak ? myRank.boardLimit + '+' : '未上榜' }}</text>
				</view>
				<view class="mrb-mid">
					<text class="mrb-desc">{{ myRankDesc }}</text>
					<view class="mrb-prog"><view class="mrb-fill" :style="{ width: myRankProgress + '%' }"></view></view>
				</view>
				<view class="mrb-act" @click="myRankAction">
					<text>{{ myRankActionLabel }}</text>
				</view>
			</view>
		</view>

		<view v-if="rankRuleVisible" class="lot-mask" @click="rankRuleVisible = false">
			<view class="lot-sheet rule-sheet" @click.stop>
				<view class="lot-handle"></view>
				<text class="lot-sheet-title">排行榜奖励</text>
				<text v-if="rankPeriod" class="rule-period">{{ rankPeriod }} 月榜 · 位掩码组合奖励</text>
				<view class="rule-list">
					<view v-for="g in rankRewardGroups" :key="g.key" class="rr-row" :class="g.covered ? 'covered' : ''">
						<view class="rr-range"><text>{{ g.covered ? g.range + ' · 我' : g.range }}</text></view>
						<view class="rr-items">
							<view v-for="(it, ii) in g.items" :key="ii" class="rr-item">
								<text>{{ it }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="lot-sheet-btn on" @click="rankRuleVisible = false"><text>我知道了</text></view>
				<view class="lot-close" @click="rankRuleVisible = false"><text>关闭</text></view>
			</view>
		</view>

		<view v-if="lotteryVisible" class="lot-mask" @click="closeLottery">
			<view class="lot-sheet" @click.stop>
				<view class="lot-handle"></view>
				<text class="lot-sheet-title">签到抽奖</text>
				<view class="lot-pool">
					<view v-for="p in displayPool" :key="p.id" class="lot-cell" :class="lotting && lotIndex === p.slot ? 'hit' : ''">
						<text class="lot-name">{{ p.name }}</text>
					</view>
				</view>
				<view v-if="lotResult" class="lot-result">
					<text>恭喜获得：{{ lotResult.winName }}</text>
				</view>
				<view class="lot-sheet-btn" :class="remainLottery > 0 && !lotting ? 'on' : 'off'" @click="doLottery">
					<text v-if="lotting">抽奖中…</text>
					<text v-else-if="remainLottery > 0">抽奖（剩 {{ remainLottery }} 次）</text>
					<text v-else>没有剩余抽奖次数</text>
				</view>
				<view class="lot-close" @click="closeLottery"><text>关闭</text></view>
			</view>
		</view>

		<view v-if="makeupVisible" class="lot-mask" @click="makeupVisible = false">
			<view class="lot-sheet" @click.stop>
				<view class="lot-handle"></view>
				<text class="lot-sheet-title">确认补签</text>
				<text class="lot-result">{{ makeupDateLabel }}？</text>
				<picker mode="date" :end="yesterdayStr" :value="makeupDate" @change="e => makeupDate = e.detail.value">
					<view class="mk-date-pick"><text>修改日期：{{ makeupDate }}</text></view>
				</picker>
				<view class="lot-sheet-btn on" @click="confirmMakeup"><text>确认补签</text></view>
				<view class="lot-close" @click="makeupVisible = false"><text>取消</text></view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		localStorage
	} from '../../js_sdk/mp-storage/mp-storage/index.js'

	export default {
		name: 'checkin',
		data() {
			return {
				tabs: ['签到页', '排行榜', '动态'],
				tabIndex: 0,
				isLoggedIn: false,
				token: '',
				dateText: '',
				defaultAvatar: '/static/image/travel/ranking/grade.png',

				isLoading: false,
				isSigning: false,
				isRefreshing: false,
				signedToday: false,
				streak: 0,
				monthSignCount: 0,
				monthSignDays: [],
				rewards: [],
				remainLottery: 0,
				lotteryPool: [],
				makeupCardCount: 0,
				isMakeupMode: false,
				claimingIds: {},
				recentlyClaimedIds: [],

				viewYear: 2026,
				viewMonth: 9,
				historyDays: {},
				monthDaysCache: {},
				weekLabels: ['一', '二', '三', '四', '五', '六', '日'],

				lotteryVisible: false,
				lotting: false,
				lotIndex: -1,
				lotResult: null,

				makeupVisible: false,
				makeupDate: '',
				makeupDateRaw: '',

				isLoadingRank: false,
				isRefreshingRank: false,
				rankList: [],
				rankRewards: [],
				rankPeriod: '',
				rankLimit: 50,

				isLoadingDynamic: false,
				isRefreshingDyn: false,
				isLoadingMoreDynamic: false,
				hasMoreDynamic: true,
				dynamicPage: 1,
				dynamicList: [],
				rankRuleVisible: false
			}
		},
		computed: {
			sortedRewards() {
				return (this.rewards || []).slice().sort(function(a, b) {
					return (a.days || 0) - (b.days || 0)
				})
			},
			viewingCurrentMonth() {
				var n = new Date()
				return this.viewYear === n.getFullYear() && this.viewMonth === (n.getMonth() + 1)
			},
			displayPool() {
				var pool = this.lotteryPool || []
				var items = pool.map(function(p, i) {
					return {
						id: p.id != null ? p.id : i,
						name: p.name || p.propName || '神秘奖励',
						slot: i
					}
				})
				if (items.length > 8) {
					return items.slice(0, 8)
				}
				while (items.length < 8 && pool.length) {
					var src = pool[items.length % pool.length]
					items.push({
						id: 'dup' + items.length,
						name: src.name || src.propName || '神秘奖励',
						slot: items.length
					})
				}
				return items
			},
			makeupDateLabel() {
				if (!this.makeupDateRaw || this.makeupDateRaw.length < 8) return '该日期'
				var y = this.makeupDateRaw.substring(0, 4)
				var m = parseInt(this.makeupDateRaw.substring(4, 6), 10)
				var d = parseInt(this.makeupDateRaw.substring(6, 8), 10)
				return y + '年' + m + '月' + d + '日'
			},
			yesterdayStr() {
				var n = new Date()
				n.setDate(n.getDate() - 1)
				return this.formatYmd(n)
			},
			calendarCells() {
				var y = this.viewYear
				var m = this.viewMonth
				var first = new Date(y, m - 1, 1)
				var startW = (first.getDay() + 6) % 7
				var daysInMonth = new Date(y, m, 0).getDate()
				var cells = []
				for (var i = 0; i < startW; i++) {
					cells.push({
						day: '',
						empty: true
					})
				}
				var signedSet = this.viewingCurrentMonth ? this.monthSignDays : (this.historyDays[y + '-' + this.pad(m)] || [])
				var today = this.formatYmd(new Date())
				for (var d = 1; d <= daysInMonth; d++) {
					var ds = String(y) + this.pad(m) + this.pad(d)
					var iso = String(y) + '-' + this.pad(m) + '-' + this.pad(d)
					cells.push({
						day: d,
						dateStr: ds,
						isSigned: signedSet.indexOf(ds) >= 0,
						isToday: iso === today,
						isPast: iso < today,
						isFuture: iso > today
					})
				}
				return cells
			},
			myRank() {
				var list = this.rankList || []
				var idx = -1
				for (var i = 0; i < list.length; i++) {
					if (list[i].isMe) {
						idx = i
						break
					}
				}
				if (idx >= 0) {
					return {
						rank: list[idx].rank || 0,
						streak: list[idx].streak || 0,
						prevStreak: idx > 0 ? list[idx - 1].streak : null,
						boardLimit: null
					}
				}
				var full = list.length >= this.rankLimit
				return {
					rank: null,
					streak: this.streak > 0 ? this.streak : null,
					prevStreak: null,
					boardLimit: full ? list.length : null
				}
			},
			myRankDesc() {
				var mine = this.myRank
				var my = mine.streak || 0
				if (mine.rank == null) {
					if (mine.streak == null) return '本月还没有签到记录，签到后即可参与排名'
					if (mine.boardLimit != null) return '连签 ' + my + ' 天 · 暂未进入本月前 ' + mine.boardLimit + ' 名'
					return '连签 ' + my + ' 天 · 暂未上榜'
				}
				if (mine.rank === 1) return '连签 ' + my + ' 天 · 当前领跑本月榜单'
				var prev = mine.prevStreak
				if (prev == null || prev <= my) return '连签 ' + my + ' 天 · 保持签到即可稳住名次'
				return '连签 ' + my + ' 天 · 距第 ' + (mine.rank - 1) + ' 名还差 ' + (prev - my) + ' 天'
			},
			myRankProgress() {
				var mine = this.myRank
				var my = mine.streak || 0
				if (mine.rank == null) {
					var limit = mine.boardLimit || 0
					if (!limit) return 0
					return Math.min(100, Math.round((my / limit) * 100))
				}
				var prev = mine.prevStreak || 0
				if (prev <= 0) return 100
				return Math.min(100, Math.round((my / prev) * 100))
			},
			myRankActionLabel() {
				return this.myRank.rank == null && this.myRank.streak == null ? '去签到' : '规则'
			},
			rankRewardGroups() {
				var rewards = this.rankRewards || []
				var map = {}
				var order = []
				for (var i = 0; i < rewards.length; i++) {
					var r = rewards[i]
					var min = r.rankMin || 0
					var max = r.rankMax || min
					var key = min + '-' + max
					if (!map[key]) {
						map[key] = {
							key: key,
							rankMin: min,
							rankMax: max,
							items: []
						}
						order.push(key)
					}
					var rt = r.rewardType || 0
					var amount = r.amount || 0
					var propName = r.propName || ''
					var titleName = r.titleName || ''
					var text = r.text || ''
					var label = ''
					if ((rt & 1) !== 0) {
						label = (propName || '专属道具') + ' ×1'
						if (map[key].items.indexOf(label) < 0) map[key].items.push(label)
					}
					if ((rt & 2) !== 0 && amount > 0) {
						label = amount + ' ' + this.$API.getCurrencyName()
						if (map[key].items.indexOf(label) < 0) map[key].items.push(label)
					}
					if ((rt & 4) !== 0) {
						label = '称号：' + (titleName || '专属称号')
						if (map[key].items.indexOf(label) < 0) map[key].items.push(label)
					}
					if (rt === 0 && text) {
						if (map[key].items.indexOf(text) < 0) map[key].items.push(text)
					}
				}
				var self = this
				return order.map(function(k) {
					var g = map[k]
					var range = g.rankMin === g.rankMax ? ('第' + g.rankMin + '名') : ('第' + g.rankMin + '-' + g.rankMax + '名')
					if (!g.items.length) g.items.push('奖励待管理员配置')
					return {
						key: g.key,
						range: range,
						items: g.items,
						covered: self.myRank.rank != null && self.myRank.rank >= g.rankMin && self.myRank.rank <= g.rankMax
					}
				})
			}
		},
		onLoad() {
			if (localStorage.getItem('token')) {
				this.token = localStorage.getItem('token')
			}
			var now = new Date()
			var weeks = ['一', '二', '三', '四', '五', '六', '日']
			this.dateText = (now.getMonth() + 1) + '月' + now.getDate() + '日 · 星期' + weeks[(now.getDay() + 6) % 7]
			this.viewYear = now.getFullYear()
			this.viewMonth = now.getMonth() + 1
			this.recheckLogin()
		},
		onShow() {
			if (this.isLoggedIn) {
				this.loadSignCenter(true)
			}
		},
		methods: {
			goBack() {
				uni.navigateBack({
					delta: 1
				})
			},
			pad(n) {
				return n < 10 ? '0' + n : String(n)
			},
			formatYmd(d) {
				return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate())
			},
			toInt(v) {
				if (v === null || v === undefined) return 0
				var n = parseInt(v, 10)
				return isNaN(n) ? 0 : n
			},
			toArray(v) {
				if (Array.isArray(v)) return v
				return []
			},
			parseDaySet(v) {
				if (Array.isArray(v)) return v.map(function(x) {
					return String(x)
				})
				return []
			},
			toast(msg) {
				uni.showToast({
					title: msg || '',
					icon: 'none'
				})
			},
			recheckLogin() {
				this.token = localStorage.getItem('token') || ''
				this.isLoggedIn = !!this.token
				if (this.isLoggedIn) {
					this.loadSignCenter()
				}
			},
			switchTab(i) {
				this.tabIndex = i
				if (!this.isLoggedIn) return
				if (i === 1 && !this.rankList.length && !this.isLoadingRank) {
					this.loadRank()
				} else if (i === 2 && !this.dynamicList.length && !this.isLoadingDynamic) {
					this.loadDynamic(true)
				}
			},
			request(opts) {
				var that = this
				return new Promise(function(resolve, reject) {
					that.$Net.request({
						url: opts.url,
						data: opts.data || {},
						header: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						method: opts.method || 'get',
						dataType: 'json',
						success: function(res) {
							resolve(res.data || {})
						},
						fail: function() {
							reject(new Error('network'))
						}
					})
				})
			},
			loadSignCenter(silent) {
				var that = this
				if (!that.token) return Promise.resolve()
				if (!silent) that.isLoading = true
				return that.request({
					url: that.$API.signCenter(),
					data: {
						token: that.token
					},
					method: 'get'
				}).then(function(res) {
					if (!silent) that.isLoading = false
					if (res.code == 1 && res.data) {
						var d = res.data
						that.signedToday = d.signedToday === true || d.signedToday === 1
						that.streak = that.toInt(d.streak)
						that.monthSignCount = that.toInt(d.monthSignCount)
						that.monthSignDays = that.parseDaySet(d.monthSignDays)
						that.rewards = that.toArray(d.rewards)
						that.remainLottery = that.toInt(d.remainLottery)
						that.lotteryPool = that.toArray(d.lotteryPool)
						that.makeupCardCount = that.toInt(d.makeupCardCount)
						if (that.makeupCardCount <= 0) that.isMakeupMode = false
						for (var i = 0; i < that.rewards.length; i++) {
							var rid = that.toInt(that.rewards[i].id)
							if (that.recentlyClaimedIds.indexOf(rid) >= 0) {
								that.rewards[i].claimed = true
								that.rewards[i].canClaim = false
							}
						}
					} else if (!silent) {
						that.toast(res.msg || '加载失败')
					}
				}).catch(function() {
					if (!silent) {
						that.isLoading = false
						that.toast('网络错误，请稍后重试')
					}
				})
			},
			doSign() {
				var that = this
				if (that.signedToday || that.isSigning) return
				that.isSigning = true
				that.request({
					url: that.$API.doSign(),
					data: {
						token: that.token
					},
					method: 'post'
				}).then(function(res) {
					that.isSigning = false
					if (res.code == 1 && res.data) {
						var d = res.data
						that.signedToday = true
						that.streak = that.toInt(d.streak)
						that.monthSignCount += 1
						var now = new Date()
						var today = String(now.getFullYear()) + that.pad(now.getMonth() + 1) + that.pad(now.getDate())
						if (that.monthSignDays.indexOf(today) < 0) that.monthSignDays.push(today)
						var award = that.toInt(d.award)
						var addExp = that.toInt(d.addExp)
						var newRewards = that.toInt(d.newRewards)
						uni.showModal({
							title: '签到成功',
							content: '获得 ' + award + ' ' + that.$API.getCurrencyName() + '、' + addExp + ' 经验' + (newRewards > 0 ? '，可领取奖励 ×' + newRewards : ''),
							showCancel: false
						})
						that.loadSignCenter(true)
						that.loadRank(true)
						that.loadDynamic(true)
					} else {
						that.toast(res.msg || '签到失败')
					}
				}).catch(function() {
					that.isSigning = false
					that.toast('网络错误，请稍后重试')
				})
			},
			canClaim(r) {
				if (!r) return false
				if (r.claimed) return false
				if (r.canClaim === true || r.canClaim === 1) return true
				return this.streak >= this.toInt(r.days)
			},
			badgeClass(r) {
				if (r.claimed) return 'done'
				if (this.canClaim(r)) return 'can'
				return ''
			},
			rewardDesc(r) {
				var type = this.toInt(r.rewardType)
				var amount = this.toInt(r.amount)
				var currency = this.$API.getCurrencyName()
				if (type === 1) return amount + ' ' + currency
				if (type === 2) return amount + ' 经验'
				if (type === 3) return (r.propName || '道具') + ' ×' + amount
				if (type === 4) return '抽奖机会 ×' + amount
				return r.text || '神秘奖励'
			},
			claimReward(r) {
				var that = this
				var rid = that.toInt(r.id)
				if (that.claimingIds[rid]) return
				that.$set(that.claimingIds, rid, true)
				that.request({
					url: that.$API.claimSignReward(),
					data: {
						token: that.token,
						rewardId: rid
					},
					method: 'post'
				}).then(function(res) {
					that.$set(that.claimingIds, rid, false)
					that.toast(res.msg || '操作完成')
					if (res.code == 1) {
						that.recentlyClaimedIds.push(rid)
						r.claimed = true
						r.canClaim = false
						if (that.toInt(r.rewardType) === 4) {
							if (res.data && res.data.remainLottery !== undefined && res.data.remainLottery !== null) {
								that.remainLottery = that.toInt(res.data.remainLottery)
							} else {
								that.remainLottery += that.toInt(r.amount)
							}
						}
						that.loadSignCenter(true)
					} else if ((res.msg || '').indexOf('已领取') >= 0) {
						r.claimed = true
						r.canClaim = false
					}
				}).catch(function() {
					that.$set(that.claimingIds, rid, false)
					that.toast('网络错误，请稍后重试')
				})
			},
			toggleMakeup() {
				if (this.makeupCardCount <= 0) {
					this.toast('没有可用的补签卡')
					this.isMakeupMode = false
					return
				}
				this.isMakeupMode = !this.isMakeupMode
			},
			cellClass(cell) {
				if (!cell || cell.empty) return 'empty'
				var cls = []
				if (cell.isSigned) cls.push('signed')
				if (cell.isToday) cls.push('today')
				if (this.isMakeupMode && cell.isPast && !cell.isSigned && !cell.isFuture) cls.push('mk')
				return cls.join(' ')
			},
			onDayTap(cell) {
				if (!cell || cell.empty) return
				if (!cell.isPast || cell.isSigned) return
				if (!this.isMakeupMode) return
				if (this.makeupCardCount <= 0) {
					this.toast('没有可用的补签卡')
					this.isMakeupMode = false
					return
				}
				this.makeupDateRaw = cell.dateStr
				this.makeupDate = cell.dateStr.substring(0, 4) + '-' + cell.dateStr.substring(4, 6) + '-' + cell.dateStr.substring(6, 8)
				this.makeupVisible = true
			},
			pickMakeupDate() {
				if (this.makeupCardCount <= 0) {
					this.toast('没有可用的补签卡')
					return
				}
				this.makeupDate = this.yesterdayStr
				this.makeupDateRaw = this.yesterdayStr.replace(/-/g, '')
				this.makeupVisible = true
			},
			confirmMakeup() {
				var that = this
				var dateStr = (that.makeupDate || '').replace(/-/g, '')
				if (!dateStr || dateStr.length !== 8) {
					that.toast('请选择日期')
					return
				}
				var signed = that.viewingCurrentMonth ? that.monthSignDays : (that.historyDays[that.viewYear + '-' + that.pad(that.viewMonth)] || [])
				if (signed.indexOf(dateStr) >= 0) {
					that.toast('该日期已签到，无需补签')
					return
				}
				that.request({
					url: that.$API.makeupSign(),
					data: {
						token: that.token,
						date: dateStr
					},
					method: 'post'
				}).then(function(res) {
					that.makeupVisible = false
					if (res.code == 1) {
						var ym = dateStr.substring(0, 6)
						var now = new Date()
						var curYm = String(now.getFullYear()) + that.pad(now.getMonth() + 1)
						if (ym === curYm && that.monthSignDays.indexOf(dateStr) < 0) {
							that.monthSignDays.push(dateStr)
						}
						delete that.monthDaysCache[that.viewYear + '-' + that.pad(that.viewMonth)]
						delete that.historyDays[that.viewYear + '-' + that.pad(that.viewMonth)]
						that.makeupCardCount = Math.max(0, that.makeupCardCount - 1)
						if (that.toInt(res.data && res.data.streak) > 0) that.streak = that.toInt(res.data.streak)
						if (that.makeupCardCount <= 0) that.isMakeupMode = false
						that.toast(res.msg || '补签成功')
						that.loadSignCenter(true)
						that.loadRank(true)
					} else {
						that.toast(res.msg || '补签失败')
					}
				}).catch(function() {
					that.makeupVisible = false
					that.toast('网络错误，请稍后重试')
				})
			},
			loadMonthDays(monthKey, force) {
				var that = this
				if (!force && that.monthDaysCache[monthKey]) {
					that.historyDays[monthKey] = that.monthDaysCache[monthKey]
					return Promise.resolve(that.monthDaysCache[monthKey])
				}
				return that.request({
					url: that.$API.monthSignDays(),
					data: {
						token: that.token,
						month: monthKey
					},
					method: 'get'
				}).then(function(res) {
					if (res.code == 1 && res.data) {
						var days = that.parseDaySet(res.data.days)
						that.monthDaysCache[monthKey] = days
						that.historyDays[monthKey] = days
						return days
					}
					that.toast(res.msg || '加载失败')
					return null
				}).catch(function() {
					return null
				})
			},
			shiftMonth(delta) {
				var n = new Date()
				var y = this.viewYear
				var m = this.viewMonth + delta
				while (m < 1) {
					m += 12
					y -= 1
				}
				while (m > 12) {
					m -= 12
					y += 1
				}
				if (y > n.getFullYear() || (y === n.getFullYear() && m > n.getMonth() + 1)) return
				this.viewYear = y
				this.viewMonth = m
				if (!(y === n.getFullYear() && m === n.getMonth() + 1)) {
					var key = y + '-' + this.pad(m)
					this.loadMonthDays(key, false)
				}
			},
			backToCurrentMonth() {
				var n = new Date()
				this.viewYear = n.getFullYear()
				this.viewMonth = n.getMonth() + 1
			},
			openLottery() {
				if (!this.lotteryPool.length) {
					this.toast('抽奖池未配置')
					return
				}
				this.lotResult = null
				this.lotIndex = -1
				this.lotteryVisible = true
			},
			closeLottery() {
				if (this.lotting) return
				this.lotteryVisible = false
				this.loadSignCenter(true)
			},
			doLottery() {
				var that = this
				if (that.lotting || that.remainLottery <= 0) return
				that.lotting = true
				that.lotResult = null
				that.request({
					url: that.$API.signLottery(),
					data: {
						token: that.token
					},
					method: 'post'
				}).then(function(res) {
					if (res.code == 1 && res.data) {
						var winId = res.data.winId
						var display = that.displayPool
						var target = 0
						for (var i = 0; i < display.length; i++) {
							if (String(display[i].id) === String(winId)) {
								target = i
								break
							}
						}
						var step = 0
						var total = 16 + target
						var timer = setInterval(function() {
							step++
							that.lotIndex = step % display.length
							if (step >= total) {
								clearInterval(timer)
								that.lotIndex = target
								that.lotting = false
								that.lotResult = res.data
								that.remainLottery = that.toInt(res.data.remain)
								that.toast(res.msg || '抽奖成功')
							}
						}, 60)
					} else {
						that.lotting = false
						that.toast(res.msg || '抽奖失败')
					}
				}).catch(function() {
					that.lotting = false
					that.toast('网络错误，请稍后重试')
				})
			},
			loadRank(silent) {
				var that = this
				if (!that.token) return Promise.resolve()
				if (!silent) that.isLoadingRank = true
				return that.request({
					url: that.$API.signRank(),
					data: {
						token: that.token,
						limit: that.rankLimit
					},
					method: 'get'
				}).then(function(res) {
					if (!silent) that.isLoadingRank = false
					if (res.code == 1 && res.data) {
						that.rankList = that.toArray(res.data.rankList)
						that.rankRewards = that.toArray(res.data.rankRewards)
						that.rankPeriod = res.data.period || ''
					}
				}).catch(function() {
					if (!silent) that.isLoadingRank = false
				})
			},
			avatarOf(item) {
				var info = item && item.userInfo
				if (info && info.avatar) return info.avatar
				return this.defaultAvatar
			},
			nameOf(item) {
				var info = item && item.userInfo
				if (!info) return '用户'
				return info.screenName || info.name || '用户'
			},
			loadDynamic(reset) {
				var that = this
				if (!that.token) return Promise.resolve()
				if (reset) {
					that.isLoadingDynamic = true
					that.dynamicPage = 1
					that.hasMoreDynamic = true
				}
				return that.request({
					url: that.$API.signDynamic(),
					data: {
						token: that.token,
						page: reset ? 1 : that.dynamicPage,
						limit: 20
					},
					method: 'get'
				}).then(function(res) {
					that.isLoadingDynamic = false
					if (res.code == 1 && res.data) {
						var list = that.toArray(res.data.list)
						that.dynamicList = list
						that.dynamicPage = that.toInt(res.data.page) || 1
						that.hasMoreDynamic = list.length >= that.toInt(res.data.limit) || 20
					}
				}).catch(function() {
					that.isLoadingDynamic = false
				})
			},
			loadMoreDynamic() {
				var that = this
				if (that.isLoadingMoreDynamic || !that.hasMoreDynamic || that.isLoadingDynamic) return
				that.isLoadingMoreDynamic = true
				var next = that.dynamicPage + 1
				that.request({
					url: that.$API.signDynamic(),
					data: {
						token: that.token,
						page: next,
						limit: 20
					},
					method: 'get'
				}).then(function(res) {
					that.isLoadingMoreDynamic = false
					if (res.code == 1 && res.data) {
						var list = that.toArray(res.data.list)
						var seen = {}
						for (var i = 0; i < that.dynamicList.length; i++) {
							var k = String(that.dynamicList[i].type) + '_' + String(that.dynamicList[i].uid) + '_' + String(that.dynamicList[i].created) + '_' + String(that.dynamicList[i].text)
							seen[k] = 1
						}
						for (var j = 0; j < list.length; j++) {
							var dk = String(list[j].type) + '_' + String(list[j].uid) + '_' + String(list[j].created) + '_' + String(list[j].text)
							if (!seen[dk]) that.dynamicList.push(list[j])
						}
						that.dynamicPage = next
						that.hasMoreDynamic = list.length >= 20
					}
				}).catch(function() {
					that.isLoadingMoreDynamic = false
				})
			},
			formatRelative(ts) {
				var t = this.toInt(ts)
				if (!t) return ''
				if (t > 1e12) t = Math.floor(t / 1000)
				var now = Math.floor(Date.now() / 1000)
				var diff = now - t
				if (diff < 60) return '刚刚'
				if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
				if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
				if (diff < 2592000) return Math.floor(diff / 86400) + '天前'
				var d = new Date(t * 1000)
				return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate())
			},
			myRankAction() {
				if (this.myRankActionLabel === '去签到') {
					this.switchTab(0)
					return
				}
				if (!this.rankRewardGroups.length) {
					this.toast('暂无奖励配置')
					return
				}
				this.rankRuleVisible = true
			},
			onRefreshHome() {
				var that = this
				that.isRefreshing = true
				that.monthDaysCache = {}
				that.historyDays = {}
				that.loadSignCenter().then(function() {
					that.isRefreshing = false
				}).catch(function() {
					that.isRefreshing = false
				})
			},
			onRefreshRank() {
				var that = this
				that.isRefreshingRank = true
				that.loadRank().then(function() {
					that.isRefreshingRank = false
				}).catch(function() {
					that.isRefreshingRank = false
				})
			},
			onRefreshDyn() {
				var that = this
				that.isRefreshingDyn = true
				that.loadDynamic(true).then(function() {
					that.isRefreshingDyn = false
				}).catch(function() {
					that.isRefreshingDyn = false
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.checkin-page {
		min-height: 100vh;
		height: 100vh;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		&.gold-bg {
			background: linear-gradient(180deg, #1d1710 0%, #14100a 55%, #faf6ec 55%, #faf6ec 100%);
		}

		&.blue-bg {
			background: #f5f8fc;
		}
	}

	.checkin-header {
		flex-shrink: 0;
		position: relative;
		z-index: 10;
	}

	.hd-left {
		padding: 8rpx 16rpx;
		color: #fff;
		font-size: 36rpx;
	}

	.hd-center {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.hd-title {
		color: #fff;
		font-size: 34rpx;
		font-weight: 700;
		letter-spacing: 1rpx;
	}

	.hd-sub {
		margin-top: 4rpx;
		color: #c2af8b;
		font-size: 22rpx;
	}

	.hd-right {
		min-width: 100rpx;
		display: flex;
		justify-content: flex-end;
		padding-right: 16rpx;
	}

	.hd-badge {
		display: flex;
		align-items: center;
		gap: 4rpx;
		padding: 6rpx 16rpx;
		border-radius: 24rpx;
		background: #2c2416;
		border: 1rpx solid rgba(201, 154, 69, 0.55);
		color: #fff;
		font-size: 22rpx;
		font-weight: 600;

		text {
			color: #e9a93c;
			font-size: 22rpx;
		}
	}

	.tab-bar {
		flex-shrink: 0;
		margin: 0 28rpx 20rpx;
		height: 84rpx;
		border-radius: 42rpx;
		background: rgba(44, 36, 22, 0.35);
		border: 1rpx solid rgba(201, 154, 69, 0.24);
		display: flex;
		align-items: center;
		padding: 6rpx;
		box-sizing: border-box;
		position: relative;
		z-index: 9;
	}

	.tab-item {
		flex: 1;
		height: 72rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 36rpx;
		color: #c2af8b;
		font-size: 28rpx;
		position: relative;

		&.on {
			background: #2c2416;
			border: 1rpx solid rgba(201, 154, 69, 0.55);
			color: #e9a93c;
			font-weight: 700;
		}
	}

	.tab-dot {
		position: absolute;
		bottom: 8rpx;
		width: 28rpx;
		height: 6rpx;
		border-radius: 4rpx;
		background: linear-gradient(90deg, #f7d98a, #e9a93c, #de9b2e);
	}

	.tab-body {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.tab-scroll {
		height: 100%;
		box-sizing: border-box;
	}

	.home-panel,
	.blue-panel {
		padding: 8rpx 32rpx 40rpx;
		max-width: 720px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.sign-hero {
		background: #fff;
		border-radius: 48rpx;
		border: 1rpx solid rgba(201, 154, 69, 0.35);
		padding: 28rpx 32rpx;
		box-shadow: 0 16rpx 40rpx rgba(233, 169, 60, 0.18);
		box-sizing: border-box;
	}

	.hero-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
	}

	.fire-chip {
		display: inline-flex;
		align-items: center;
		gap: 6rpx;
		padding: 6rpx 18rpx;
		border-radius: 22rpx;
		background: #2c2416;
		border: 1rpx solid rgba(201, 154, 69, 0.55);

		text {
			color: #f5e9ce;
			font-size: 22rpx;
			font-weight: 600;
		}

		.cuIcon-hot {
			color: #e9a93c;
			font-size: 24rpx;
		}
	}

	.streak-line {
		margin-top: 10rpx;
		display: flex;
		align-items: baseline;
		gap: 10rpx;
	}

	.streak-num {
		font-size: 72rpx;
		font-weight: 800;
		color: #2b2415;
		line-height: 1;

		&.gold {
			background: linear-gradient(135deg, #f7d98a, #e9a93c, #de9b2e);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
		}
	}

	.streak-unit {
		font-size: 24rpx;
		color: #7c6c4d;
		font-weight: 600;
	}

	.sign-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 22rpx 36rpx;
		border-radius: 44rpx;
		background: linear-gradient(135deg, #f7d98a 0%, #e9a93c 46%, #f3ce7c 78%, #de9b2e 100%);
		color: #3a2a08;
		font-size: 28rpx;
		font-weight: 800;
		box-shadow: 0 10rpx 28rpx rgba(233, 169, 60, 0.45);
		white-space: nowrap;

		&.done {
			background: #fbf4e4;
			color: #8a6a28;
			border: 1rpx solid rgba(160, 116, 32, 0.42);
			box-shadow: none;
		}

		&.busy {
			opacity: 0.7;
		}
	}

	.chip-row {
		margin-top: 24rpx;
		display: flex;
		gap: 12rpx;
	}

	.data-chip {
		flex: 1;
		background: #f2eada;
		border: 1rpx solid rgba(160, 116, 32, 0.2);
		border-radius: 24rpx;
		padding: 14rpx 8rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.chip-val {
		display: flex;
		align-items: baseline;
		gap: 4rpx;

		text {
			font-size: 28rpx;
			font-weight: 800;
			color: #8a6a28;
		}
	}

	.chip-u {
		font-size: 20rpx !important;
		font-weight: 400 !important;
		color: #7c6c4d !important;
	}

	.chip-label {
		margin-top: 2rpx;
		font-size: 20rpx;
		color: #7c6c4d;
	}

	.section-card {
		margin-top: 28rpx;
		background: #fff;
		border-radius: 40rpx;
		border: 1rpx solid rgba(160, 116, 32, 0.2);
		padding: 28rpx 24rpx;
		box-sizing: border-box;

		&.blue {
			border-color: #d7e3f0;
		}
	}

	.sec-head {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 24rpx;
	}

	.sec-icon {
		width: 56rpx;
		height: 56rpx;
		border-radius: 16rpx;
		background: #fbf4e4;
		border: 1rpx solid rgba(233, 169, 60, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;

		&.blue {
			background: #e3f2fd;
			border-color: rgba(33, 150, 243, 0.4);
		}

		text {
			color: #8a6a28;
			font-size: 30rpx;
		}

		&.blue text {
			color: #2196f3;
		}
	}

	.sec-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #2b2415;
	}

	.makeup-bar {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 14rpx 20rpx;
		border-radius: 20rpx;
		background: #f2eada;
		border: 1rpx solid rgba(160, 116, 32, 0.2);
		margin-bottom: 20rpx;

		&.on {
			background: rgba(33, 150, 243, 0.08);
			border-color: rgba(33, 150, 243, 0.5);
		}

		.cuIcon-recharge {
			color: #2196f3;
			font-size: 32rpx;
		}
	}

	.mk-count {
		font-size: 26rpx;
		font-weight: 700;
		color: #2196f3;
	}

	.mk-pick {
		margin-left: auto;
		padding: 6rpx 18rpx;
		border-radius: 24rpx;
		background: #2196f3;

		text {
			color: #fff;
			font-size: 22rpx;
			font-weight: 700;
		}
	}

	.mk-action {
		margin-left: auto;
		font-size: 24rpx;
		color: #6b7a8c;
		font-weight: 600;
	}

	.makeup-bar.on .mk-action {
		margin-left: 16rpx;
		color: #2196f3;
	}

	.cal-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.cal-arrow {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		background: #f0f4f9;
		display: flex;
		align-items: center;
		justify-content: center;

		text {
			color: #6b7a8c;
			font-size: 26rpx;
		}
	}

	.cal-ym {
		font-size: 28rpx;
		font-weight: 700;
		color: #2b2415;
		min-width: 180rpx;
		text-align: center;
	}

	.cal-today {
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		background: #e3f2fd;

		text {
			color: #2196f3;
			font-size: 22rpx;
			font-weight: 600;
		}
	}

	.cal-week,
	.cal-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 8rpx;
	}

	.cal-week {
		margin-bottom: 8rpx;

		text {
			text-align: center;
			font-size: 22rpx;
			color: #93a3b4;
		}
	}

	.cal-cell {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-size: 24rpx;
		color: #1b2430;
		background: #f0f4f9;

		&.empty {
			background: transparent;
		}

		&.signed {
			background: linear-gradient(135deg, #f7d98a, #e9a93c);
			color: #3a2a08;
			font-weight: 700;
		}

		&.today {
			border: 2rpx solid #e9a93c;
		}

		&.mk {
			background: #e8eef6;
			color: #2196f3;
		}
	}

	.mk-tip {
		margin-top: 16rpx;

		text {
			font-size: 22rpx;
			color: #7c6c4d;
		}
	}

	.reward-item {
		display: flex;
		align-items: center;
		gap: 18rpx;
		padding: 20rpx;
		border-radius: 28rpx;
		background: #f2eada;
		border: 1rpx solid rgba(160, 116, 32, 0.2);
		margin-bottom: 16rpx;

		&.can {
			background: rgba(33, 150, 243, 0.08);
			border-color: rgba(33, 150, 243, 0.55);
			border-width: 2rpx;
		}

		&.claimed {
			opacity: 0.55;
		}

		&:last-child {
			margin-bottom: 0;
		}
	}

	.badge-circle {
		width: 84rpx;
		height: 84rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f0f4f9;
		border: 1rpx solid rgba(160, 116, 32, 0.25);
		flex-shrink: 0;

		text {
			color: #6b7a8c;
			font-size: 34rpx;
		}

		&.can {
			background: #e3f2fd;
			border: 3rpx solid #2196f3;
			box-shadow: 0 0 16rpx rgba(33, 150, 243, 0.35);

			text {
				color: #e9a93c;
			}
		}

		&.done {
			background: #e8eef6;

			text {
				color: #2e9e6b;
			}
		}
	}

	.reward-mid {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.reward-days {
		font-size: 28rpx;
		font-weight: 700;
		color: #1b2430;
	}

	.reward-desc {
		font-size: 24rpx;
		color: #6b7a8c;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.reward-prog {
		font-size: 22rpx;
		font-weight: 600;
		color: #6b7a8c;

		&.gold {
			color: #8a6a28;
		}
	}

	.reward-btn {
		padding: 12rpx 24rpx;
		border-radius: 40rpx;
		font-size: 24rpx;
		font-weight: 700;
		white-space: nowrap;

		&.muted {
			background: #e8eef6;
			border: 1rpx solid #d7e3f0;
			color: #6b7a8c;
			font-weight: 600;
		}

		&.act {
			background: #2196f3;
			color: #fff;
			box-shadow: 0 6rpx 14rpx rgba(33, 150, 243, 0.35);
		}
	}

	.lot-entry {
		display: flex;
		align-items: center;
		gap: 24rpx;
		border-color: rgba(233, 169, 60, 0.45);
		border-width: 2rpx;

		&.dim {
			opacity: 0.7;
		}
	}

	.lot-dice {
		width: 100rpx;
		height: 100rpx;
		border-radius: 32rpx;
		background: #fbf4e4;
		border: 1rpx solid rgba(233, 169, 60, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;

		text {
			color: #e9a93c;
			font-size: 48rpx;
		}
	}

	.lot-mid {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.lot-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #1b2430;
	}

	.lot-sub {
		font-size: 22rpx;
		color: #6b7a8c;
	}

	.lot-badge {
		align-self: flex-start;
		padding: 6rpx 18rpx;
		border-radius: 24rpx;
		background: #f0f4f9;
		border: 1rpx solid #d7e3f0;

		text {
			font-size: 22rpx;
			color: #6b7a8c;
		}

		&.on {
			background: #e3f2fd;
			border-color: rgba(33, 150, 243, 0.4);

			text {
				color: #8a6a28;
				font-weight: 700;
			}
		}
	}

	.lot-arrow {
		color: #e9a93c;
		font-size: 40rpx;
	}

	.period-pill {
		display: flex;
		justify-content: center;
		margin-bottom: 20rpx;

		text {
			padding: 10rpx 28rpx;
			border-radius: 40rpx;
			background: rgba(33, 150, 243, 0.1);
			color: #2196f3;
			font-size: 26rpx;
			font-weight: 600;
		}
	}

	.rank-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 20rpx 24rpx;
		border-radius: 28rpx;
		background: #fff;
		border: 1rpx solid #d7e3f0;
		margin-bottom: 14rpx;
		box-sizing: border-box;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

		&.me {
			border-color: rgba(33, 150, 243, 0.45);
			border-width: 2rpx;
			background: rgba(33, 150, 243, 0.08);
			box-shadow: 0 6rpx 16rpx rgba(33, 150, 243, 0.12);
		}

		&.champ {
			background: linear-gradient(135deg, #fff8e6 0%, #fbf4e4 100%);
			border-color: rgba(233, 169, 60, 0.55);
			box-shadow: 0 6rpx 18rpx rgba(233, 169, 60, 0.18);
		}
	}

	.rank-no {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f0f4f9;
		font-size: 26rpx;
		font-weight: 700;
		color: #6b7a8c;
		flex-shrink: 0;

		&.r1 {
			background: radial-gradient(circle, rgba(255, 215, 0, 0.45), rgba(255, 215, 0, 0.15));
			color: #e9a93c;
		}

		&.r2 {
			background: radial-gradient(circle, rgba(192, 192, 192, 0.5), rgba(192, 192, 192, 0.15));
			color: #8f8f8f;
		}

		&.r3 {
			background: radial-gradient(circle, rgba(215, 154, 91, 0.5), rgba(215, 154, 91, 0.15));
			color: #8c5a2c;
		}

		text {
			font-size: 26rpx;
			font-weight: 700;
		}
	}

	.rank-medal {
		display: flex;
		align-items: center;
		justify-content: center;

		.cuIcon-crown {
			font-size: 34rpx;
		}
	}

	.rank-no.r1 .cuIcon-crown {
		color: #e9a93c;
	}

	.rank-no.r2 .cuIcon-crown {
		color: #8f8f8f;
	}

	.rank-no.r3 .cuIcon-crown {
		color: #8c5a2c;
	}

	.rank-avatar-wrap {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		padding: 2rpx;
		background: transparent;
		flex-shrink: 0;
		box-sizing: border-box;

		&.me {
			background: #2196f3;
		}
	}

	.rank-avatar {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: rgba(33, 150, 243, 0.12);
		box-sizing: border-box;
		border: 2rpx solid #fff;
	}

	.rank-name {
		flex: 1;
		min-width: 0;

		text {
			font-size: 28rpx;
			color: #1b2430;
			font-weight: 500;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			display: block;
		}
	}

	.rank-streak {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 8rpx 18rpx;
		border-radius: 28rpx;
		background: rgba(33, 150, 243, 0.1);

		text {
			font-size: 22rpx;
			color: #2196f3;
			font-weight: 700;
		}

		&.top {
			background: rgba(233, 169, 60, 0.14);

			text {
				color: #8a6a28;
			}
		}
	}

	.rr-row {
		display: flex;
		align-items: flex-start;
		gap: 14rpx;
		padding: 14rpx;
		border-radius: 24rpx;
		margin-bottom: 10rpx;
		border: 1rpx solid transparent;
		box-sizing: border-box;

		&.covered {
			background: rgba(33, 150, 243, 0.08);
			border-color: rgba(33, 150, 243, 0.45);
		}
	}

	.rr-range {
		padding: 6rpx 14rpx;
		border-radius: 12rpx;
		background: rgba(33, 150, 243, 0.12);
		font-size: 22rpx;
		font-weight: 600;
		color: #2196f3;
		white-space: nowrap;
	}

	.rr-items {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx 20rpx;
	}

	.rr-item {
		font-size: 24rpx;
		color: #1b2430;
		font-weight: 600;
	}

	.dyn-item {
		display: flex;
		gap: 18rpx;
		padding: 20rpx;
		background: #fff;
		border: 1rpx solid #d7e3f0;
		border-radius: 28rpx;
		margin-bottom: 14rpx;
		box-sizing: border-box;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

		&.is-lot {
			border-color: rgba(233, 169, 60, 0.4);
			background: linear-gradient(135deg, #fffdf8 0%, #fff 60%);
		}
	}

	.dyn-avatar-wrap {
		width: 82rpx;
		height: 82rpx;
		border-radius: 50%;
		padding: 3rpx;
		background: #2196f3;
		flex-shrink: 0;
		box-sizing: border-box;

		&.gold {
			background: linear-gradient(135deg, #f7d98a, #e9a93c);
		}
	}

	.dyn-avatar {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 3rpx solid #fff;
		background: rgba(33, 150, 243, 0.12);
		box-sizing: border-box;
	}

	.dyn-mid {
		flex: 1;
		min-width: 0;
	}

	.dyn-line {
		font-size: 26rpx;
		line-height: 1.45;
		color: #1b2430;
		word-break: break-all;
	}

	.dyn-name {
		font-weight: 700;
		margin-right: 8rpx;
	}

	.dyn-text {
		color: #6b7a8c;

		&.blue {
			color: #2196f3;
			font-weight: 600;
		}
	}

	.dyn-meta {
		margin-top: 10rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.dyn-tag {
		padding: 4rpx 12rpx;
		border-radius: 16rpx;
		background: rgba(33, 150, 243, 0.12);

		text {
			font-size: 20rpx;
			color: #2196f3;
			font-weight: 600;
		}

		&.lot {
			background: rgba(233, 169, 60, 0.15);

			text {
				color: #8a6a28;
			}
		}
	}

	.dyn-time {
		font-size: 22rpx;
		color: #93a3b4;
	}

	.dyn-time-ico {
		font-size: 22rpx;
		color: #93a3b4;
	}

	.rule-sheet {
		max-height: 72vh;
		overflow-y: auto;
	}

	.rule-period {
		display: block;
		text-align: center;
		margin: -12rpx 0 20rpx;
		font-size: 24rpx;
		color: #2196f3;
		font-weight: 600;
	}

	.rule-list {
		margin-bottom: 24rpx;
	}

	.load-more {
		text-align: center;
		padding: 24rpx;

		text {
			font-size: 24rpx;
			color: #93a3b4;
		}
	}

	.my-rank-bar {
		position: fixed;
		left: 28rpx;
		right: 28rpx;
		bottom: calc(24rpx + constant(safe-area-inset-bottom));
		bottom: calc(24rpx + env(safe-area-inset-bottom));
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 14rpx;
		padding: 18rpx 22rpx;
		border-radius: 40rpx;
		background: #fff;
		border: 2rpx solid rgba(201, 154, 69, 0.55);
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.12);
		box-sizing: border-box;
		z-index: 20;
	}

	.mrb-label {
		width: 68rpx;

		text {
			font-size: 20rpx;
			font-weight: 800;
			color: #8a6a28;
			line-height: 1.35;
			text-align: center;
			display: block;
		}
	}

	.mrb-rank {
		display: flex;
		align-items: baseline;
		gap: 4rpx;
		min-width: 80rpx;
	}

	.mrb-num {
		font-size: 44rpx;
		font-weight: 900;
	}

	.gold-text {
		background: linear-gradient(135deg, #f7d98a, #e9a93c, #de9b2e);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.mrb-unit {
		font-size: 22rpx;
		color: #7c6c4d;
		font-weight: 700;
	}

	.mrb-none {
		font-size: 32rpx;
		font-weight: 900;
		color: #7c6c4d;
	}

	.mrb-mid {
		flex: 1;
		min-width: 0;
	}

	.mrb-desc {
		font-size: 20rpx;
		color: #7c6c4d;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
	}

	.mrb-prog {
		margin-top: 8rpx;
		height: 8rpx;
		border-radius: 6rpx;
		background: #f2eada;
		overflow: hidden;
	}

	.mrb-fill {
		height: 100%;
		background: linear-gradient(90deg, #f7d98a, #e9a93c);
		border-radius: 6rpx;
		transition: width 0.3s;
	}

	.mrb-act {
		padding: 12rpx 20rpx;
		border-radius: 28rpx;
		border: 1rpx solid rgba(201, 154, 69, 0.55);

		text {
			font-size: 22rpx;
			font-weight: 700;
			color: #8a6a28;
		}
	}

	.empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 40rpx;
		min-height: 40vh;

		&.inline {
			min-height: 30vh;
		}
	}

	.empty-icon {
		font-size: 80rpx;
		color: rgba(147, 163, 180, 0.5);
		margin-bottom: 20rpx;
	}

	.empty-text {
		font-size: 30rpx;
		color: #6b7a8c;
		font-weight: 500;
	}

	.empty-sub {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: rgba(107, 122, 140, 0.7);
	}

	.empty-btn {
		margin-top: 32rpx;
		padding: 16rpx 40rpx;
		border-radius: 40rpx;
		background: #e9a93c;

		text {
			color: #3a2a08;
			font-size: 26rpx;
			font-weight: 700;
		}
	}

	.skeleton-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		padding-top: 16rpx;
	}

	.sk {
		border-radius: 40rpx;
		background: linear-gradient(90deg, #f2eada 25%, #fbf4e4 50%, #f2eada 75%);
		background-size: 400% 100%;
		animation: sk 1.4s ease infinite;
	}

	.sk-hero {
		height: 260rpx;
	}

	.sk-cal {
		height: 440rpx;
	}

	.sk-reward {
		height: 320rpx;
	}

	@keyframes sk {
		0% {
			background-position: 100% 0;
		}

		100% {
			background-position: 0 0;
		}
	}

	.home-pad {
		height: 40rpx;
	}

	.lot-mask {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.55);
		z-index: 99;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.lot-sheet {
		width: 100%;
		max-width: 720px;
		background: #fff;
		border-radius: 40rpx 40rpx 0 0;
		padding: 20rpx 32rpx calc(40rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.lot-handle {
		width: 76rpx;
		height: 8rpx;
		border-radius: 6rpx;
		background: #d7e3f0;
		margin: 0 auto 24rpx;
	}

	.lot-sheet-title {
		display: block;
		text-align: center;
		font-size: 34rpx;
		font-weight: 700;
		color: #1b2430;
		margin-bottom: 28rpx;
	}

	.lot-pool {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14rpx;
		margin-bottom: 24rpx;
	}

	.lot-cell {
		padding: 24rpx 8rpx;
		border-radius: 20rpx;
		background: #f0f4f9;
		border: 2rpx solid transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 96rpx;
		box-sizing: border-box;

		&.hit {
			border-color: #e9a93c;
			background: #fbf4e4;
			box-shadow: 0 0 18rpx rgba(233, 169, 60, 0.55);
		}
	}

	.lot-name {
		font-size: 22rpx;
		color: #1b2430;
		text-align: center;
		line-height: 1.3;
		word-break: break-all;
	}

	.lot-result {
		text-align: center;
		font-size: 28rpx;
		font-weight: 700;
		color: #8a6a28;
		margin-bottom: 24rpx;
		min-height: 40rpx;
	}

	.lot-sheet-btn {
		width: 100%;
		height: 96rpx;
		border-radius: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		font-weight: 800;

		&.on {
			background: linear-gradient(135deg, #f7d98a, #e9a93c, #de9b2e);
			color: #3a2a08;
		}

		&.off {
			background: #e8eef6;
			color: #93a3b4;
		}
	}

	.lot-close {
		margin-top: 20rpx;
		text-align: center;

		text {
			font-size: 26rpx;
			color: #6b7a8c;
		}
	}

	.mk-date-pick {
		text-align: center;
		padding: 20rpx;
		margin-bottom: 24rpx;
		border-radius: 20rpx;
		background: #f0f4f9;

		text {
			font-size: 26rpx;
			color: #1b2430;
		}
	}

	@media screen and (max-width: 375px) {
		.home-panel,
		.blue-panel {
			padding-left: 24rpx;
			padding-right: 24rpx;
		}

		.sign-hero {
			padding: 24rpx;
			border-radius: 36rpx;
		}

		.streak-num {
			font-size: 60rpx;
		}

		.sign-btn {
			padding: 18rpx 24rpx;
			font-size: 26rpx;
		}

		.section-card {
			padding: 24rpx 18rpx;
		}

		.chip-label,
		.chip-u,
		.lot-sub {
			font-size: 18rpx;
		}

		.my-rank-bar {
			left: 16rpx;
			right: 16rpx;
			padding: 14rpx 16rpx;
			gap: 10rpx;
		}

		.mrb-desc {
			font-size: 18rpx;
		}
	}

	@media screen and (max-width: 360px) {
		.hd-title {
			font-size: 30rpx;
		}

		.tab-bar {
			margin-left: 20rpx;
			margin-right: 20rpx;
		}

		.data-chip {
			padding: 10rpx 4rpx;
		}

		.chip-val text {
			font-size: 24rpx;
		}

		.reward-btn {
			padding: 10rpx 16rpx;
			font-size: 22rpx;
		}
	}

	@media screen and (min-width: 768px) {
		.home-panel,
		.blue-panel {
			max-width: 720px;
		}

		.my-rank-bar {
			max-width: 720px;
		}

		.lot-sheet {
			max-width: 720px;
		}
	}

	@media screen and (min-width: 1024px) {
		.home-panel,
		.blue-panel {
			max-width: 720px;
		}
	}
</style>
