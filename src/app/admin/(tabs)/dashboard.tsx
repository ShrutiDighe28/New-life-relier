import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BLUE   = "#2563EB";
const TEAL   = "#0D9488";
const NAVY   = "#1E3A8A";

const RECENT_DOCTORS = [
    { id:"1", name:"Dr. Sarah Jenkins", spec:"Cardiologist",  initials:"SJ", patients:340, status:"Active"  },
    { id:"2", name:"Dr. Arjun Mehta",   spec:"Neurologist",   initials:"AM", patients:210, status:"Active"  },
    { id:"3", name:"Dr. Priya Kapoor",  spec:"Dermatologist", initials:"PK", patients:178, status:"On Leave"},
    { id:"4", name:"Dr. Rohit Sharma",  spec:"Orthopedic",    initials:"RS", patients:295, status:"Active"  },
];

const INITIAL_ACTIVITY = [
    { id:"1", type:"system",   icon:"account-plus-outline",  title:"New Doctor Registered",     sub:"Dr. Kavya Reddy — Pediatrician",      time:"5 min ago"  },
    { id:"2", type:"system",   icon:"file-check-outline",    title:"Report Approved",            sub:"Monthly performance — July 2026",     time:"22 min ago" },
    { id:"3", type:"security", icon:"account-remove-outline",title:"Patient Account Deleted",    sub:"ID PT20987 — Request by patient",     time:"1 hr ago"   },
    { id:"4", type:"security", icon:"alert-circle-outline",  title:"Emergency Alert Raised",     sub:"Priya Patel — ICU admission",          time:"2 hr ago"   },
    { id:"5", type:"billing",  icon:"cash-check",            title:"Payment Received",           sub:"Invoice #4821 — Rs. 24,500",           time:"3 hr ago"   },
];

const INITIAL_NOTIFICATIONS = [
    { id:"1", icon:"doctor",              title:"Pending Verification",   body:"Dr. Arjun Kumar awaiting credential verification",  time:"Just now",  unread:true  },
    { id:"2", icon:"alert-octagon-outline",title:"System Alert",          body:"Server memory load at 87% — monitoring active",     time:"10 min ago",unread:true  },
    { id:"3", icon:"file-chart-outline",  title:"Monthly Report Ready",   body:"July 2026 analytics report generated successfully",  time:"1 hr ago",  unread:true  },
    { id:"4", icon:"cash-multiple",       title:"Revenue Milestone",      body:"Rs. 10L revenue target reached for July",            time:"3 hr ago",  unread:false },
    { id:"5", icon:"account-clock-outline",title:"Licence Expiry Warning",body:"Dr. Priya Kapoor — medical licence expires in 7 days",time:"Yesterday",unread:false},
];

const WEEKLY  = [6, 9, 7, 12, 10, 8, 14];
const REVENUE = [4.2, 5.1, 3.8, 6.4, 5.9, 4.7, 7.2];
const DAYS    = ["M","T","W","T","F","S","S"];

// ─── SparkBar component ───────────────────────────────────────────────────────
function SparkBar({ data, color, h = 56 }: { data: number[]; color: string; h?: number }) {
    const max = Math.max(...data);
    return (
        <View style={{ flexDirection:"row", alignItems:"flex-end", gap:4, height:h }}>
            {data.map((v, i) => (
                <View key={i} style={{
                    flex:1,
                    height: Math.max(4, (v / max) * h),
                    backgroundColor: i === data.length - 1 ? color : color + "55",
                    borderRadius:4,
                }}/>
            ))}
        </View>
    );
}

// ─── Animated section wrapper ─────────────────────────────────────────────────
function FadeSlide({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const opacity   = useRef(new Animated.Value(0)).current;
    const translateY= useRef(new Animated.Value(18)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity,    { toValue:1, duration:380, delay, useNativeDriver:true }),
            Animated.spring(translateY, { toValue:0, friction:8, delay, useNativeDriver:true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity, transform:[{ translateY }] }}>
            {children}
        </Animated.View>
    );
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ title, action, onAction, colors }: {
    title: string; action?: string; onAction?: () => void; colors: any;
}) {
    return (
        <View style={s.secTitleRow}>
            <Text style={[s.secTitle, { color: colors.text }]}>{title}</Text>
            {action && (
                <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
                    <Text style={s.secAction}>{action}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AdminDashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();

    const [showNotif, setShowNotif]         = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [activityFilter, setActivityFilter] = useState<"all"|"security"|"billing"|"system">("all");

    const unread     = notifications.filter(n => n.unread).length;
    const adminName  = user?.fullName || "Admin User";
    const adminRole  = user?.roleName || (user?.isSuperAdmin ? "Super Administrator" : "Administrator");
    const adminInitials = adminName.trim()
        ? adminName.trim().split(" ").map((w:string)=>w[0]).slice(0,2).join("").toUpperCase()
        : "AU";
    const hour      = new Date().getHours();
    const greeting  = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    const C = {
        backgroundColor: isDark ? colors.card : "#FFFFFF",
        borderColor:     isDark ? colors.cardBorder : "#E8EFF5",
    };

    const filteredActivity = React.useMemo(() => {
        if (activityFilter === "all") return INITIAL_ACTIVITY;
        return INITIAL_ACTIVITY.filter(a => a.type === activityFilter);
    }, [activityFilter]);

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread:false })));

    // Activity type → accent colour
    const actColor = (type: string) => ({
        system:   { bg:"#EFF6FF", icon: BLUE      },
        security: { bg:"#FEF2F2", icon:"#EF4444"  },
        billing:  { bg:"#F0FDF4", icon:"#10B981"  },
    }[type] ?? { bg:"#F1F5F9", icon:"#64748B" });

    return (
        <SafeAreaView style={[s.root, { backgroundColor: isDark ? colors.background : "#F0F4FF" }]} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* ══ HEADER ══════════════════════════════════════════ */}
                <FadeSlide delay={0}>
                    <LinearGradient
                        colors={isDark ? ["#0F172A","#1E293B"] : ["#1E3A8A","#2563EB"]}
                        start={{ x:0, y:0 }} end={{ x:1, y:1 }}
                        style={s.headerGrad}
                    >
                        {/* Top row: logo + actions */}
                        <View style={s.headerTopRow}>
                            <LogoBrand size={22} fontSize={15} variant="light" />
                            <View style={s.hBtns}>
                                <TouchableOpacity style={s.hBtn} onPress={toggleTheme} activeOpacity={0.75}>
                                    <MaterialCommunityIcons
                                        name={isDark ? "weather-sunny" : "weather-night"}
                                        size={18}
                                        color={isDark ? "#F59E0B" : "#E2E8F0"}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity style={s.hBtn} onPress={() => setShowNotif(true)} activeOpacity={0.75}>
                                    <MaterialCommunityIcons
                                        name={unread > 0 ? "bell-badge-outline" : "bell-outline"}
                                        size={18}
                                        color={unread > 0 ? "#FCD34D" : "#E2E8F0"}
                                    />
                                    {unread > 0 && (
                                        <View style={s.badge}>
                                            <Text style={s.badgeTxt}>{unread}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => router.push("/admin/(tabs)/settings" as any)} activeOpacity={0.85}>
                                    <View style={s.avt}>
                                        <Text style={s.avtTxt}>{adminInitials}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Greeting row */}
                        <View style={s.greetRow}>
                            <View>
                                <Text style={s.greeting}>{greeting}, {adminName} 👋</Text>
                                <Text style={s.role}>{adminRole}  ·  Hospital Administration Portal</Text>
                            </View>
                        </View>

                        {/* Header metric strip */}
                        <View style={s.headerStrip}>
                            {[
                                { v:"48",   l:"Doctors"    },
                                { v:"2,840",l:"Patients"   },
                                { v:"186",  l:"Appts Today"},
                                { v:"99.9%",l:"Uptime"     },
                            ].map((m,i) => (
                                <View key={i} style={s.hMetricItem}>
                                    <Text style={s.hMetricVal}>{m.v}</Text>
                                    <Text style={s.hMetricLbl}>{m.l}</Text>
                                </View>
                            ))}
                        </View>
                    </LinearGradient>
                </FadeSlide>

                {/* ══ KPI CARDS ════════════════════════════════════════ */}
                <FadeSlide delay={80}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.kpiScroll}
                    >
                        {[
                            { label:"Total Doctors",    value:"48",       icon:"doctor",              sub:"+3 this month",      color:BLUE,      bg:isDark?"#1E3A8A22":"#DBEAFE", accent:BLUE     },
                            { label:"Total Patients",   value:"2,840",    icon:"account-group-outline",sub:"+124 this week",     color:"#7C3AED", bg:isDark?"#4C1D9522":"#EDE9FE", accent:"#7C3AED"},
                            { label:"Appointments",     value:"186",      icon:"calendar-month-outline",sub:"Today",             color:TEAL,      bg:isDark?"#0D948822":"#CCFBF1", accent:TEAL     },
                            { label:"Revenue Today",    value:"Rs. 52k",  icon:"cash-multiple",        sub:"+18% vs yesterday",  color:"#10B981", bg:isDark?"#14532D22":"#DCFCE7", accent:"#10B981"},
                            { label:"Pending Approvals",value:"7",        icon:"clock-alert-outline",  sub:"Action required",    color:"#F59E0B", bg:isDark?"#78350F22":"#FEF9C3", accent:"#F59E0B"},
                            { label:"Platform Rating",  value:"4.8 ★",    icon:"star-outline",         sub:"All doctors avg",    color:"#EC4899", bg:isDark?"#83183422":"#FCE7F3", accent:"#EC4899"},
                        ].map((item, i) => (
                            <View key={i} style={[s.kpiCard, C, { shadowColor: item.color }]}>
                                <View style={[s.kpiIco, { backgroundColor: item.bg }]}>
                                    <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                                </View>
                                <Text style={[s.kpiVal, { color: colors.text }]}>{item.value}</Text>
                                <Text style={[s.kpiLbl, { color: colors.textSecondary }]}>{item.label}</Text>
                                <Text style={[s.kpiSub, { color: item.color }]}>{item.sub}</Text>
                                <View style={[s.kpiAccent, { backgroundColor: item.accent }]} />
                            </View>
                        ))}
                    </ScrollView>
                </FadeSlide>

                {/* ══ SYSTEM PERFORMANCE MONITOR ══════════════════════ */}
                <FadeSlide delay={140}>
                    <View style={[s.sysCard, C]}>
                        <View style={s.sysHeaderRow}>
                            <View style={s.sysLiveRow}>
                                <Animated.View style={[s.liveDot]} />
                                <Text style={[s.sysTitle, { color: colors.text }]}>System Performance Monitor</Text>
                            </View>
                            <View style={s.sysOperBadge}>
                                <View style={s.sysOperDot} />
                                <Text style={s.sysOperTxt}>Operational</Text>
                            </View>
                        </View>

                        <View style={[s.sysDivider, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]} />

                        <View style={s.sysGrid}>
                            {[
                                { val:"42%",  lbl:"Server Load",     icon:"server-network",      color:"#2563EB", bar:0.42 },
                                { val:"128",  lbl:"Active Sessions", icon:"account-multiple",    color:"#7C3AED", bar:0.64 },
                                { val:"12ms", lbl:"DB Latency",      icon:"database-clock",      color:"#10B981", bar:0.24 },
                                { val:"99.9%",lbl:"Monthly Uptime",  icon:"shield-check-outline",color:"#10B981", bar:0.999},
                            ].map((m, i, arr) => (
                                <View key={i} style={[s.sysMetricTile, isDark ? { backgroundColor:"#0F172A" } : { backgroundColor: m.color + "0F" }]}>
                                    <MaterialCommunityIcons name={m.icon as any} size={18} color={m.color} />
                                    <Text style={[s.sysMetricVal, { color: colors.text }]}>{m.val}</Text>
                                    <Text style={[s.sysMetricLbl, { color: colors.textSecondary }]}>{m.lbl}</Text>
                                    <View style={[s.sysBarBg, { backgroundColor: isDark ? "#1E293B" : "#E2E8F0" }]}>
                                        <View style={[s.sysBarFill, { width: `${m.bar * 100}%` as any, backgroundColor: m.color }]} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </FadeSlide>

                {/* ══ HOSPITAL OVERVIEW HERO ══════════════════════════ */}
                <FadeSlide delay={180}>
                    <LinearGradient
                        colors={["#0F2460","#1E40AF","#2563EB"]}
                        start={{ x:0, y:0 }} end={{ x:1, y:1 }}
                        style={s.heroBanner}
                    >
                        <View style={s.heroBlobA} />
                        <View style={s.heroBlobB} />
                        <View style={{ flex:1, zIndex:1 }}>
                            <View style={s.heroTopRow}>
                                <View style={s.heroBadgeWrap}>
                                    <MaterialCommunityIcons name="hospital-building" size={13} color="rgba(255,255,255,0.9)" />
                                    <Text style={s.heroBadgeTxt}>LIVE ANALYTICS</Text>
                                </View>
                            </View>
                            <Text style={s.heroTitle}>Hospital Overview</Text>
                            <Text style={s.heroSub}>July 2026  ·  Real-time data</Text>
                            <View style={s.heroMetrics}>
                                {[
                                    { v:"99.8%", l:"Uptime",      icon:"shield-check"    },
                                    { v:"4.8s",  l:"Avg Load",    icon:"speedometer"     },
                                    { v:"12.4k", l:"API Calls/hr",icon:"lightning-bolt"  },
                                ].map((x,i) => (
                                    <View key={i} style={s.heroMetricItem}>
                                        <MaterialCommunityIcons name={x.icon as any} size={14} color="rgba(255,255,255,0.7)" />
                                        <Text style={s.heroMetricVal}>{x.v}</Text>
                                        <Text style={s.heroMetricLbl}>{x.l}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <MaterialCommunityIcons name="shield-check-outline" size={88} color="rgba(255,255,255,0.07)" style={s.heroBgIcon} />
                    </LinearGradient>
                </FadeSlide>

                {/* ══ CHARTS ══════════════════════════════════════════ */}
                {[
                    { title:"Weekly Appointments", data:WEEKLY,  color:BLUE,     value:"186 today",  sub:"+12% vs last week",     trend:"#10B981" },
                    { title:"Revenue Trend (Lakhs)",data:REVENUE, color:"#10B981",value:"Rs. 7.2L",   sub:"Peak performance day",  trend:"#10B981" },
                ].map((chart, ci) => (
                    <FadeSlide key={ci} delay={220 + ci * 60}>
                        <View style={s.chartSection}>
                            <SectionTitle title={chart.title} colors={colors} />
                            <View style={[s.chartCard, C]}>
                                <View style={s.chartTopRow}>
                                    <View>
                                        <Text style={[s.chartBigVal, { color: colors.text }]}>{chart.value}</Text>
                                        <Text style={[s.chartSub, { color: colors.textSecondary }]}>{chart.sub}</Text>
                                    </View>
                                    <View style={s.trendBadge}>
                                        <MaterialCommunityIcons name="trending-up" size={13} color="#10B981" />
                                        <Text style={s.trendTxt}>Up</Text>
                                    </View>
                                </View>
                                <SparkBar data={chart.data} color={chart.color} h={62} />
                                <View style={s.dayLabels}>
                                    {DAYS.map((d,i) => (
                                        <Text key={i} style={[s.dayLabel, { color: colors.textSecondary }]}>{d}</Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </FadeSlide>
                ))}

                {/* ══ QUICK ACTIONS ════════════════════════════════════ */}
                <FadeSlide delay={340}>
                    <SectionTitle title="Quick Actions" colors={colors} />
                    <View style={s.actionsGrid}>
                        {[
                            { label:"Manage Doctors",  icon:"doctor",              route:"/admin/(tabs)/doctors",  color:BLUE,      bg:isDark?"#1E3A8A22":"#DBEAFE" },
                            { label:"Manage Patients", icon:"account-group-outline",route:"/admin/(tabs)/patients", color:"#7C3AED", bg:isDark?"#4C1D9522":"#EDE9FE" },
                            { label:"View Reports",    icon:"chart-bar",            route:"/admin/(tabs)/reports",  color:TEAL,      bg:isDark?"#0D948822":"#CCFBF1" },
                            { label:"Portal Settings", icon:"cog-outline",          route:"/admin/(tabs)/settings", color:"#64748B", bg:isDark?"#33415522":"#F1F5F9" },
                        ].map((item, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[s.actionItem, C, { shadowColor: item.color }]}
                                onPress={() => router.push(item.route as any)}
                                activeOpacity={0.82}
                            >
                                <View style={[s.actionIco, { backgroundColor: item.bg }]}>
                                    <MaterialCommunityIcons name={item.icon as any} size={21} color={item.color} />
                                </View>
                                <Text style={[s.actionLbl, { color: colors.text }]} numberOfLines={1}>{item.label}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </FadeSlide>

                {/* ══ RECENT DOCTORS ═══════════════════════════════════ */}
                <FadeSlide delay={400}>
                    <SectionTitle title="Recent Doctors" action="See All" onAction={() => router.push("/admin/(tabs)/doctors" as any)} colors={colors} />
                    <View style={s.docListCard}>
                        {RECENT_DOCTORS.map((doc, i) => (
                            <View key={doc.id}>
                                <View style={s.docRow}>
                                    <LinearGradient
                                        colors={[BLUE, NAVY]}
                                        style={s.docAvt}
                                    >
                                        <Text style={s.docAvtTxt}>{doc.initials}</Text>
                                    </LinearGradient>
                                    <View style={{ flex:1 }}>
                                        <Text style={[s.docName, { color: colors.text }]}>{doc.name}</Text>
                                        <Text style={[s.docSpec, { color: colors.textSecondary }]}>
                                            {doc.spec}  ·  {doc.patients} patients
                                        </Text>
                                    </View>
                                    <View style={[s.docStatusPill, {
                                        backgroundColor: doc.status === "Active" ? "#ECFDF5" : "#FFFBEB",
                                    }]}>
                                        <View style={[s.docStatusDot, { backgroundColor: doc.status === "Active" ? "#10B981" : "#F59E0B" }]} />
                                        <Text style={[s.docStatusTxt, { color: doc.status === "Active" ? "#10B981" : "#D97706" }]}>
                                            {doc.status}
                                        </Text>
                                    </View>
                                </View>
                                {i < RECENT_DOCTORS.length - 1 && (
                                    <View style={[s.listDivider, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]} />
                                )}
                            </View>
                        ))}
                    </View>
                </FadeSlide>

                {/* ══ RECENT ACTIVITY ══════════════════════════════════ */}
                <FadeSlide delay={460}>
                    <SectionTitle title="Recent Activity" colors={colors} />

                    {/* Filter chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
                        {(["all","security","system","billing"] as const).map(tag => {
                            const active = activityFilter === tag;
                            return (
                                <TouchableOpacity
                                    key={tag}
                                    onPress={() => setActivityFilter(tag)}
                                    activeOpacity={0.8}
                                    style={[s.filterChip, active
                                        ? { backgroundColor: BLUE }
                                        : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }
                                    ]}
                                >
                                    <Text style={[s.filterChipTxt, { color: active ? "#FFFFFF" : colors.textSecondary }]}>
                                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <View style={[s.activityCard, C]}>
                        {filteredActivity.map((item, i) => {
                            const ac = actColor(item.type);
                            return (
                                <View key={item.id}>
                                    <View style={s.actRow}>
                                        <View style={[s.actIco, { backgroundColor: isDark ? "#1E293B" : ac.bg }]}>
                                            <MaterialCommunityIcons name={item.icon as any} size={16} color={ac.icon} />
                                        </View>
                                        <View style={{ flex:1 }}>
                                            <Text style={[s.actTitle, { color: colors.text }]}>{item.title}</Text>
                                            <Text style={[s.actSub, { color: colors.textSecondary }]}>{item.sub}</Text>
                                        </View>
                                        <Text style={[s.actTime, { color: colors.textSecondary }]}>{item.time}</Text>
                                    </View>
                                    {i < filteredActivity.length - 1 && (
                                        <View style={[s.listDivider, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]} />
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    <View style={{ height: 32 }} />
                </FadeSlide>

            </ScrollView>

            {/* ══ NOTIFICATIONS MODAL ═════════════════════════════ */}
            <Modal visible={showNotif} transparent animationType="slide" onRequestClose={() => setShowNotif(false)}>
                <Pressable style={s.overlay} onPress={() => setShowNotif(false)}>
                    <Pressable style={[s.sheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={[s.sheetHandle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        <View style={s.sheetTitleRow}>
                            <Text style={[s.sheetTitle, { color: colors.text }]}>Notifications</Text>
                            <View style={{ flexDirection:"row", alignItems:"center", gap:10 }}>
                                {unread > 0 && (
                                    <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
                                        <Text style={{ color:BLUE, fontSize:12, fontWeight:"700" }}>Mark all read</Text>
                                    </TouchableOpacity>
                                )}
                                <View style={s.unreadBadge}>
                                    <Text style={s.unreadBadgeTxt}>{unread}</Text>
                                </View>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {notifications.map(n => (
                                <View key={n.id} style={[s.nRow, {
                                    backgroundColor: n.unread ? (isDark ? "#2563EB0F" : "#EFF6FF") : "transparent",
                                    borderColor: isDark ? "#334155" : "#F1F5F9",
                                    borderLeftColor: n.unread ? BLUE : "transparent",
                                }]}>
                                    <View style={[s.nIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                        <MaterialCommunityIcons name={n.icon as any} size={18} color={BLUE} />
                                    </View>
                                    <View style={{ flex:1 }}>
                                        <Text style={{ fontSize:13, fontWeight:"700", color:colors.text }}>{n.title}</Text>
                                        <Text style={{ fontSize:11, color:colors.textSecondary, marginTop:2, lineHeight:16 }}>{n.body}</Text>
                                        <Text style={{ fontSize:10, color:colors.textSecondary, marginTop:4 }}>{n.time}</Text>
                                    </View>
                                    {n.unread && <View style={[s.dot, { backgroundColor: BLUE }]} />}
                                </View>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingBottom: 48 },

    // ── Header gradient ────────────────────────────────────────────────────
    headerGrad: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        marginBottom: 20,
    },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },
    hBtns:  { flexDirection: "row", alignItems: "center", gap: 8 },
    hBtn: {
        width: 38, height: 38, borderRadius: 19,
        justifyContent: "center", alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
    },
    badge: {
        position: "absolute", top: 5, right: 5,
        backgroundColor: "#EF4444",
        minWidth: 14, height: 14, borderRadius: 7,
        justifyContent: "center", alignItems: "center",
        paddingHorizontal: 2,
    },
    badgeTxt: { color: "#FFFFFF", fontSize: 8, fontWeight: "800" },
    avt: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: "rgba(255,255,255,0.22)",
        justifyContent: "center", alignItems: "center",
        borderWidth: 2, borderColor: "rgba(255,255,255,0.4)",
    },
    avtTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },

    greetRow:    { marginBottom: 18 },
    greeting:    { fontSize: 19, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.4 },
    role:        { fontSize: 11, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginTop: 3 },

    headerStrip: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    hMetricItem:  { flex: 1, alignItems: "center" },
    hMetricVal:   { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
    hMetricLbl:   { fontSize: 9,  fontWeight: "600", color: "rgba(255,255,255,0.65)", marginTop: 2, textAlign: "center" },

    // ── Section titles ─────────────────────────────────────────────────────
    secTitleRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingHorizontal: 16 },
    secTitle:     { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
    secAction:    { fontSize: 13, fontWeight: "700", color: BLUE },

    // ── KPI cards ──────────────────────────────────────────────────────────
    kpiScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4, marginBottom: 20 },
    kpiCard: {
        borderRadius: 20, borderWidth: 1,
        padding: 16, minWidth: 140,
        gap: 4, overflow: "hidden",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    },
    kpiIco:   { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 4 },
    kpiVal:   { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
    kpiLbl:   { fontSize: 11, fontWeight: "600" },
    kpiSub:   { fontSize: 10, fontWeight: "600" },
    kpiAccent:{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, opacity: 0.7 },

    // ── System performance card ────────────────────────────────────────────
    sysCard: {
        borderRadius: 20, borderWidth: 1,
        padding: 18, marginHorizontal: 16, marginBottom: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
    },
    sysHeaderRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    sysLiveRow:    { flexDirection: "row", alignItems: "center", gap: 8 },
    liveDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" },
    sysTitle:      { fontSize: 14, fontWeight: "800" },
    sysOperBadge:  { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#ECFDF5", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
    sysOperDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
    sysOperTxt:    { fontSize: 11, fontWeight: "700", color: "#10B981" },
    sysDivider:    { height: 1, marginBottom: 14 },
    sysGrid:       { flexDirection: "row", gap: 10 },
    sysMetricTile: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 4 },
    sysMetricVal:  { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
    sysMetricLbl:  { fontSize: 9,  fontWeight: "600", textAlign: "center" },
    sysBarBg:      { width: "100%", height: 4, borderRadius: 2, marginTop: 4, overflow: "hidden" },
    sysBarFill:    { height: "100%", borderRadius: 2 },

    // ── Hero banner ────────────────────────────────────────────────────────
    heroBanner: {
        borderRadius: 22, padding: 20,
        marginHorizontal: 16, marginBottom: 20,
        overflow: "hidden", flexDirection: "row", alignItems: "center",
        shadowColor: NAVY, shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
    },
    heroBlobA: {
        position: "absolute", width: 180, height: 180, borderRadius: 90,
        backgroundColor: "rgba(255,255,255,0.06)", top: -60, right: -40,
    },
    heroBlobB: {
        position: "absolute", width: 120, height: 120, borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.04)", bottom: -40, right: 60,
    },
    heroTopRow:     { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    heroBadgeWrap:  { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    heroBadgeTxt:   { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.9)", letterSpacing: 0.5 },
    heroTitle:      { fontSize: 20, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.4 },
    heroSub:        { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 3, marginBottom: 14 },
    heroMetrics:    { flexDirection: "row", gap: 20 },
    heroMetricItem: { alignItems: "flex-start", gap: 2 },
    heroMetricVal:  { fontSize: 17, fontWeight: "800", color: "#FFFFFF" },
    heroMetricLbl:  { fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: "600" },
    heroBgIcon:     { position: "absolute", right: -10, bottom: -10 },

    // ── Charts ─────────────────────────────────────────────────────────────
    chartSection: { marginBottom: 20, paddingHorizontal: 0 },
    chartCard: {
        borderRadius: 20, borderWidth: 1,
        padding: 18, marginHorizontal: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },
    chartTopRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
    chartBigVal:  { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
    chartSub:     { fontSize: 11, marginTop: 2 },
    trendBadge:   { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    trendTxt:     { color: "#10B981", fontSize: 11, fontWeight: "700" },
    dayLabels:    { flexDirection: "row", marginTop: 8 },
    dayLabel:     { flex: 1, textAlign: "center", fontSize: 10, fontWeight: "600" },

    // ── Quick actions ──────────────────────────────────────────────────────
    actionsGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, marginBottom: 24 },
    actionItem: {
        width: "47.5%", borderRadius: 18, borderWidth: 1,
        padding: 14, flexDirection: "row", alignItems: "center", gap: 10,
        shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    },
    actionIco:    { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    actionLbl:    { fontSize: 12, fontWeight: "700", flex: 1 },

    // ── Recent doctors ─────────────────────────────────────────────────────
    docListCard: {
        borderRadius: 20, borderWidth: 1,
        borderColor: "#E8EFF5",
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16, marginBottom: 24,
        paddingVertical: 4,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },
    docRow:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
    docAvt:       { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
    docAvtTxt:    { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
    docName:      { fontSize: 14, fontWeight: "700" },
    docSpec:      { fontSize: 11, marginTop: 2 },
    docStatusPill:{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
    docStatusDot: { width: 6, height: 6, borderRadius: 3 },
    docStatusTxt: { fontSize: 10, fontWeight: "700" },
    listDivider:  { height: 1, marginHorizontal: 16 },

    // ── Activity feed ──────────────────────────────────────────────────────
    filterScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
    filterChip:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
    filterChipTxt:{ fontSize: 11, fontWeight: "700" },
    activityCard: {
        borderRadius: 20, borderWidth: 1,
        marginHorizontal: 16, marginBottom: 8,
        paddingVertical: 4,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },
    actRow:   { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
    actIco:   { width: 36, height: 36, borderRadius: 11, justifyContent: "center", alignItems: "center" },
    actTitle: { fontSize: 13, fontWeight: "700" },
    actSub:   { fontSize: 11, marginTop: 1 },
    actTime:  { fontSize: 10 },

    // ── Notifications modal ────────────────────────────────────────────────
    overlay:      { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    sheet:        { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingTop: 10, maxHeight: "82%" },
    sheetHandle:  { width: 44, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
    sheetTitleRow:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
    sheetTitle:   { fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
    unreadBadge:  { backgroundColor: "#EF4444", minWidth: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center", paddingHorizontal: 5 },
    unreadBadgeTxt:{ color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
    nRow: {
        flexDirection: "row", alignItems: "center", gap: 12,
        padding: 12, borderRadius: 14, borderWidth: 1, borderLeftWidth: 3,
        marginBottom: 8,
    },
    nIco: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    dot:  { width: 8, height: 8, borderRadius: 4 },
});
