import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Arrays are stored as JSON strings under SQLite.
const arr = (v: string[]) => JSON.stringify(v);

// ---------------------------------------------------------------------------
// Ingredient master list (original descriptions written for this project)
// ---------------------------------------------------------------------------
const ingredients: {
  name: string;
  nameEn?: string;
  type: string;
  abv?: number;
  description?: string;
}[] = [
  { name: "金酒", nameEn: "Gin", type: "base_spirit", abv: 40, description: "以杜松子为灵魂的烈酒，草本气息清晰，是马天尼等众多经典的骨架。" },
  { name: "威士忌", nameEn: "Whisky", type: "base_spirit", abv: 40, description: "谷物蒸馏并经橡木桶陈年，带来烟熏、香草与谷物的层次。" },
  { name: "波本威士忌", nameEn: "Bourbon", type: "base_spirit", abv: 40, description: "以玉米为主料的美式威士忌，甜润饱满，焦糖与香草调突出。" },
  { name: "伏特加", nameEn: "Vodka", type: "base_spirit", abv: 40, description: "口感干净中性，几乎不抢味，适合作为各种调饮的底子。" },
  { name: "白朗姆酒", nameEn: "White Rum", type: "base_spirit", abv: 40, description: "甘蔗发酵蒸馏，清爽轻盈，是莫吉托与戴吉利的常见基酒。" },
  { name: "黑朗姆酒", nameEn: "Dark Rum", type: "base_spirit", abv: 40, description: "经桶陈，色深味厚，带焦糖与香料感，常用于热带风味。" },
  { name: "白兰地", nameEn: "Brandy", type: "base_spirit", abv: 40, description: "葡萄蒸馏酒，圆润温暖，果香与木桶气息交织。" },
  { name: "龙舌兰", nameEn: "Tequila", type: "base_spirit", abv: 40, description: "以蓝色龙舌兰为原料，带泥土与青草气息，玛格丽特的灵魂。" },
  { name: "干味美思", nameEn: "Dry Vermouth", type: "liqueur", abv: 18, description: "加香加强型葡萄酒，干爽草本，干马天尼不可或缺。" },
  { name: "甜味美思", nameEn: "Sweet Vermouth", type: "liqueur", abv: 16, description: "偏甜的加香葡萄酒，红色，常见于尼格罗尼与曼哈顿。" },
  { name: "金巴利", nameEn: "Campari", type: "liqueur", abv: 25, description: "鲜红色的苦味利口酒，柑橘与草本的微苦回甘，尼格罗尼的标志。" },
  { name: "橙皮利口酒", nameEn: "Triple Sec", type: "liqueur", abv: 30, description: "橙皮风味的甜利口酒，为酸甜类鸡尾酒补充明亮的橘香。" },
  { name: "咖啡利口酒", nameEn: "Coffee Liqueur", type: "liqueur", abv: 20, description: "浓郁的咖啡甜酒，是浓缩咖啡马天尼与白俄罗斯的关键。" },
  { name: "青柠汁", nameEn: "Lime Juice", type: "juice", description: "现榨青柠汁，尖锐清爽的酸，是许多热带与酸味鸡尾酒的酸源。" },
  { name: "柠檬汁", nameEn: "Lemon Juice", type: "juice", description: "现榨柠檬汁，酸度明亮，酸味家族的基础。" },
  { name: "西柚汁", nameEn: "Grapefruit Juice", type: "juice", description: "微苦带甜的西柚汁，清爽解腻，适合夏日长饮。" },
  { name: "橙汁", nameEn: "Orange Juice", type: "juice", description: "现榨橙汁，自然甜润，柔化烈酒的锐度。" },
  { name: "蔓越莓汁", nameEn: "Cranberry Juice", type: "juice", description: "酸甜偏涩，色泽红艳，常用于柯梦波丹一类调饮。" },
  { name: "菠萝汁", nameEn: "Pineapple Juice", type: "juice", description: "浓郁热带果汁，摇制后会产生绵密泡沫。" },
  { name: "糖浆", nameEn: "Simple Syrup", type: "syrup", description: "等比糖水熬制，最通用的甜味来源。" },
  { name: "蜂蜜糖浆", nameEn: "Honey Syrup", type: "syrup", description: "蜂蜜与水调和，带花香的圆润甜味。" },
  { name: "苏打水", nameEn: "Soda Water", type: "mixer", description: "无味气泡水，拉长酒体、增添爽口气泡。" },
  { name: "汤力水", nameEn: "Tonic Water", type: "mixer", description: "带奎宁微苦的气泡水，与金酒是天作之合。" },
  { name: "姜汁汽水", nameEn: "Ginger Ale", type: "mixer", description: "带姜辣的甜气泡饮，为长饮注入辛香。" },
  { name: "可乐", nameEn: "Cola", type: "mixer", description: "经典甜气泡饮，与威士忌、朗姆都很搭。" },
  { name: "气泡酒", nameEn: "Sparkling Wine", type: "mixer", abv: 11, description: "干型起泡葡萄酒，为香槟类调饮提供细腻气泡。" },
  { name: "蛋清", nameEn: "Egg White", type: "other", description: "干摇后形成绵密泡沫，让酸味鸡尾酒口感更顺滑。" },
  { name: "薄荷叶", nameEn: "Mint", type: "garnish", description: "清凉香草，拍打释放香气，莫吉托的标配。" },
  { name: "盐", nameEn: "Salt", type: "garnish", description: "用于杯口抹盐圈，平衡并提亮风味。" },
  { name: "安格仕苦精", nameEn: "Angostura Bitters", type: "other", abv: 44, description: "高浓度草本苦精，几滴即可为酒体增添复杂的香料尾韵。" },
  // —— 为权威 IBA 配方补充的原料 ——
  { name: "红石榴糖浆", nameEn: "Grenadine", type: "syrup", description: "石榴风味的红色糖浆，带来甜味与红艳色泽，是龙舌兰日出渐层的来源。" },
  { name: "西柚味汽水", nameEn: "Grapefruit Soda", type: "mixer", description: "带西柚果味的甜气泡饮，清爽微苦，帕洛玛的灵魂。" },
  { name: "蜜桃利口酒", nameEn: "Peach Schnapps", type: "liqueur", abv: 20, description: "蜜桃风味的甜利口酒，果香浓郁，性感沙滩等果味调饮的关键。" },
  { name: "法勒纳姆", nameEn: "Falernum", type: "liqueur", abv: 11, description: "源自加勒比的香料利口酒，融合青柠、丁香、姜与杏仁，提基风格的秘密武器。" },
  { name: "苦艾酒", nameEn: "Absinthe", type: "base_spirit", abv: 60, description: "高酒精度的茴香草本烈酒，仅需几滴便能为酒体铺上清凉的茴芹尾韵。" },
  { name: "肉桂糖浆", nameEn: "Cinnamon Syrup", type: "syrup", description: "以肉桂熬制的香料糖浆，温暖辛香，常见于提基与冬季调饮。" },
  { name: "高度朗姆酒", nameEn: "Overproof Rum", type: "base_spirit", abv: 63, description: "酒精度极高的朗姆（如 151），少量即可强化酒体与香气，是僵尸等提基酒款的脊梁。" },
  { name: "利莱白", nameEn: "Lillet Blanc", type: "liqueur", abv: 17, description: "波尔多产的加香开胃葡萄酒，柑橘与花蜜般的香气，维斯帕马天尼的点睛之笔。" },
  // —— 为更多权威经典补充的原料 ——
  { name: "椰子奶油", nameEn: "Cream of Coconut", type: "other", description: "甜润浓稠的椰子奶油，椰林飘香与止痛药的灵魂，带来热带的丝滑口感。" },
  { name: "青柠甜浆", nameEn: "Lime Cordial", type: "syrup", description: "加糖的浓缩青柠糖浆（如 Rose's），酸甜浓郁，是金蕾的经典酸源。" },
  { name: "姜啤", nameEn: "Ginger Beer", type: "mixer", description: "比姜汁汽水更辛辣浓烈的发酵姜味气泡饮，莫斯科骡子不可或缺。" },
  { name: "阿玛雷托", nameEn: "Amaretto", type: "liqueur", abv: 24, description: "意大利杏仁风味甜利口酒，杏仁与杏核的香甜，教父的另一半。" },
  { name: "杏仁糖浆", nameEn: "Orgeat", type: "syrup", description: "以杏仁、糖与橙花水制成的糖浆，坚果花香交织，提基鸡尾酒的标志性甜味。" },
];

// ---------------------------------------------------------------------------
// Cocktails. recipe = ingredient name -> amount. Original tasting copy.
// ---------------------------------------------------------------------------
type Recipe = { name: string; amount: string; optional?: boolean };
const cocktails: {
  name: string;
  nameEn?: string;
  slug: string;
  category: string;
  flavorTags: string[];
  glassType?: string;
  garnish?: string;
  difficulty: string;
  description: string;
  instructions: string[];
  recipe: Recipe[];
}[] = [
  {
    name: "咸狗", nameEn: "Salty Dog", slug: "salty-dog", category: "便利店调酒",
    flavorTags: ["清爽", "微咸", "果香"], glassType: "高球杯", garnish: "杯口盐圈", difficulty: "easy",
    description: "伏特加兑西柚汁，关键是杯口那一圈盐。咸、酸、清爽交织，特别适合炎热的夏天。",
    instructions: ["杯口用柠檬抹湿后蘸一圈盐", "杯中加满冰块", "倒入伏特加", "补满西柚汁，轻轻搅匀"],
    recipe: [{ name: "伏特加", amount: "45ml" }, { name: "西柚汁", amount: "120ml" }, { name: "盐", amount: "适量" }],
  },
  {
    name: "威士忌可乐", nameEn: "Whisky Coke", slug: "whisky-coke", category: "便利店调酒",
    flavorTags: ["甜", "顺口"], glassType: "高球杯", garnish: "柠檬角", difficulty: "easy",
    description: "也许是世界上最摇滚的喝法。威士忌的烟熏与可乐的甜撞在一起，简单直接，一口下去就来劲。",
    instructions: ["杯中装满冰块", "倒入威士忌", "缓缓补满可乐", "挤入一角柠檬"],
    recipe: [{ name: "威士忌", amount: "45ml" }, { name: "可乐", amount: "150ml" }],
  },
  {
    name: "热带风暴", nameEn: "Tropical Storm", slug: "tropical-storm", category: "馥郁果香 (The Fruity & Tropical Family)",
    flavorTags: ["甜", "果香", "微辣"], glassType: "高球杯", garnish: "菠萝片", difficulty: "easy",
    description: "一杯让你瞬间穿越到海岛的饮料。朗姆酒加上各种热带果汁，最后用姜汁汽水注入灵魂，又甜又辣，非常过瘾。",
    instructions: ["杯中加冰", "依次倒入黑朗姆、菠萝汁、橙汁", "补满姜汁汽水", "搅拌后以菠萝片装饰"],
    recipe: [{ name: "黑朗姆酒", amount: "45ml" }, { name: "菠萝汁", amount: "60ml" }, { name: "橙汁", amount: "30ml" }, { name: "姜汁汽水", amount: "60ml" }],
  },
  {
    name: "玛格丽特", nameEn: "Margarita", slug: "margarita", category: "IBA-难忘经典",
    flavorTags: ["酸", "清爽", "果香"], glassType: "玛格丽特杯", garnish: "杯口盐圈", difficulty: "medium",
    description: "最经典的龙舌兰鸡尾酒之一，酸爽的青柠与橙皮利口酒结合，口感清新而平衡。",
    instructions: ["杯口抹盐圈备用", "摇壶中加冰", "倒入龙舌兰、橙皮利口酒、青柠汁", "充分摇匀后滤入杯中"],
    recipe: [{ name: "龙舌兰", amount: "50ml" }, { name: "橙皮利口酒", amount: "20ml" }, { name: "青柠汁", amount: "25ml" }, { name: "盐", amount: "适量" }],
  },
  {
    name: "莫吉托", nameEn: "Mojito", slug: "mojito", category: "畅爽气泡 (The Highball Family)",
    flavorTags: ["清爽", "酸", "甜"], glassType: "高球杯", garnish: "薄荷叶", difficulty: "medium",
    description: "古巴的夏日代名词。薄荷与青柠在杯中释放清凉，白朗姆与气泡水让整杯轻盈跳跃。",
    instructions: ["杯中放薄荷叶与糖浆，轻压出香", "挤入青柠汁", "加满碎冰，倒入白朗姆", "补苏打水，轻搅，插薄荷装饰"],
    recipe: [{ name: "白朗姆酒", amount: "45ml" }, { name: "青柠汁", amount: "25ml" }, { name: "糖浆", amount: "15ml" }, { name: "薄荷叶", amount: "8片" }, { name: "苏打水", amount: "适量" }],
  },
  {
    name: "金汤力", nameEn: "Gin Tonic", slug: "gin-tonic", category: "畅爽气泡 (The Highball Family)",
    flavorTags: ["清爽", "苦", "顺口"], glassType: "高球杯", garnish: "青柠角", difficulty: "easy",
    description: "最简单也最耐喝的长饮。金酒的草本遇上汤力水的奎宁微苦，气泡里全是清爽。",
    instructions: ["杯中加满冰", "倒入金酒", "缓缓补满汤力水", "挤入青柠角并投入杯中"],
    recipe: [{ name: "金酒", amount: "45ml" }, { name: "汤力水", amount: "120ml" }, { name: "青柠汁", amount: "10ml" }],
  },
  {
    name: "尼格罗尼", nameEn: "Negroni", slug: "negroni", category: "醇厚烈酒 (The Spirit-Forward Family)",
    flavorTags: ["苦", "厚重", "层次丰富"], glassType: "古典杯", garnish: "橙皮", difficulty: "easy",
    description: "等比例的金酒、金巴利与甜味美思，苦与甜在舌尖反复拉锯，是大人味的代表。",
    instructions: ["古典杯中加入大冰块", "依次倒入金酒、金巴利、甜味美思", "搅拌至冰凉", "扭转橙皮释放精油后投入"],
    recipe: [{ name: "金酒", amount: "30ml" }, { name: "金巴利", amount: "30ml" }, { name: "甜味美思", amount: "30ml" }],
  },
  {
    name: "曼哈顿", nameEn: "Manhattan", slug: "manhattan", category: "醇厚烈酒 (The Spirit-Forward Family)",
    flavorTags: ["厚重", "层次丰富"], glassType: "马天尼杯", garnish: "酒渍樱桃", difficulty: "medium",
    description: "威士忌与甜味美思的优雅对话，几滴苦精串起整杯的香料尾韵，沉稳而有格调。",
    instructions: ["搅拌杯中加冰", "倒入威士忌、甜味美思、苦精", "搅拌约 20 秒", "滤入冰镇马天尼杯，放入樱桃"],
    recipe: [{ name: "威士忌", amount: "60ml" }, { name: "甜味美思", amount: "30ml" }, { name: "安格仕苦精", amount: "2 dash" }],
  },
  {
    name: "干马天尼", nameEn: "Dry Martini", slug: "dry-martini", category: "醇厚烈酒 (The Spirit-Forward Family)",
    flavorTags: ["厚重", "顺口"], glassType: "马天尼杯", garnish: "橄榄或柠檬皮", difficulty: "medium",
    description: "鸡尾酒中的西装革履。金酒与少量干味美思，冷冽干净，考验的是基酒本身的质感。",
    instructions: ["搅拌杯中加满冰", "倒入金酒与干味美思", "搅拌至充分冰镇", "滤入冰镇杯，以橄榄或柠檬皮装饰"],
    recipe: [{ name: "金酒", amount: "60ml" }, { name: "干味美思", amount: "10ml" }],
  },
  {
    name: "威士忌酸", nameEn: "Whisky Sour", slug: "whisky-sour", category: "清新酸甜 (The Sour Family)",
    flavorTags: ["酸", "甜", "顺口"], glassType: "古典杯", garnish: "柠檬片", difficulty: "medium",
    description: "酸味家族的入门标杆。波本的甜润、柠檬的明亮与蛋清的绵密，三者达成奇妙的平衡。",
    instructions: ["摇壶中加入波本、柠檬汁、糖浆、蛋清", "先不加冰干摇起泡", "再加冰摇匀", "滤入加冰的古典杯"],
    recipe: [{ name: "波本威士忌", amount: "50ml" }, { name: "柠檬汁", amount: "25ml" }, { name: "糖浆", amount: "20ml" }, { name: "蛋清", amount: "1个", optional: true }],
  },
  {
    name: "戴吉利", nameEn: "Daiquiri", slug: "daiquiri", category: "清新酸甜 (The Sour Family)",
    flavorTags: ["酸", "清爽"], glassType: "马天尼杯", garnish: "青柠片", difficulty: "easy",
    description: "白朗姆、青柠、糖浆三件套，简洁到极致却极考验配比，是检验调酒功底的试金石。",
    instructions: ["摇壶加冰", "倒入白朗姆、青柠汁、糖浆", "充分摇匀", "滤入冰镇杯"],
    recipe: [{ name: "白朗姆酒", amount: "50ml" }, { name: "青柠汁", amount: "25ml" }, { name: "糖浆", amount: "15ml" }],
  },
  {
    name: "大都会", nameEn: "Cosmopolitan", slug: "cosmopolitan", category: "清新酸甜 (The Sour Family)",
    flavorTags: ["酸", "果香", "甜"], glassType: "马天尼杯", garnish: "橙皮", difficulty: "medium",
    description: "粉红色的都市情调。伏特加打底，蔓越莓与青柠提供酸甜，橙皮利口酒收束出明亮的果香。",
    instructions: ["摇壶加冰", "倒入伏特加、橙皮利口酒、蔓越莓汁、青柠汁", "摇匀", "滤入冰镇杯，喷附橙皮香"],
    recipe: [{ name: "伏特加", amount: "40ml" }, { name: "橙皮利口酒", amount: "15ml" }, { name: "蔓越莓汁", amount: "30ml" }, { name: "青柠汁", amount: "15ml" }],
  },
  {
    name: "古典", nameEn: "Old Fashioned", slug: "old-fashioned", category: "IBA-难忘经典",
    flavorTags: ["厚重", "层次丰富"], glassType: "古典杯", garnish: "橙皮", difficulty: "medium",
    description: "鸡尾酒的鼻祖之一。一块方糖、几滴苦精、一份波本，简单元素堆叠出醇厚的时间感。",
    instructions: ["杯中放糖浆与苦精", "加入少量波本搅匀", "放入大冰块，补满波本", "扭橙皮投入"],
    recipe: [{ name: "波本威士忌", amount: "60ml" }, { name: "糖浆", amount: "10ml" }, { name: "安格仕苦精", amount: "2 dash" }],
  },
  {
    name: "自由古巴", nameEn: "Cuba Libre", slug: "cuba-libre", category: "便利店调酒",
    flavorTags: ["甜", "顺口"], glassType: "高球杯", garnish: "青柠角", difficulty: "easy",
    description: "朗姆加可乐，再挤一片青柠就升华了。看似随意，那一抹酸却让整杯立刻有了精神。",
    instructions: ["杯中加冰", "挤入青柠汁并投入青柠角", "倒入白朗姆", "补满可乐，轻搅"],
    recipe: [{ name: "白朗姆酒", amount: "45ml" }, { name: "可乐", amount: "120ml" }, { name: "青柠汁", amount: "10ml" }],
  },
  {
    name: "螺丝起子", nameEn: "Screwdriver", slug: "screwdriver", category: "便利店调酒",
    flavorTags: ["果香", "顺口", "甜"], glassType: "高球杯", garnish: "橙片", difficulty: "easy",
    description: "伏特加加橙汁，据说名字来自工人用螺丝刀搅拌。喝起来几乎尝不到酒，危险又好喝。",
    instructions: ["杯中加冰", "倒入伏特加", "补满橙汁", "轻搅，橙片装饰"],
    recipe: [{ name: "伏特加", amount: "45ml" }, { name: "橙汁", amount: "120ml" }],
  },
  {
    name: "浓缩咖啡马天尼", nameEn: "Espresso Martini", slug: "espresso-martini", category: "IBA-新时代创新",
    flavorTags: ["厚重", "层次丰富", "甜"], glassType: "马天尼杯", garnish: "咖啡豆", difficulty: "hard",
    description: "提神又微醺的夜晚之选。伏特加与咖啡利口酒裹挟着新鲜浓缩咖啡，摇出标志性的绵密咖啡泡沫。",
    instructions: ["摇壶加冰", "倒入伏特加、咖啡利口酒、一份浓缩咖啡与糖浆", "用力摇匀产生泡沫", "滤入冰镇杯，点缀咖啡豆"],
    recipe: [{ name: "伏特加", amount: "40ml" }, { name: "咖啡利口酒", amount: "20ml" }, { name: "糖浆", amount: "10ml" }],
  },
  {
    name: "白俄罗斯", nameEn: "White Russian", slug: "white-russian", category: "IBA-当代经典",
    flavorTags: ["甜", "厚重"], glassType: "古典杯", garnish: "无", difficulty: "easy",
    description: "甜品般的存在。伏特加与咖啡利口酒打底，最后铺上一层奶油，丝滑顺喉。",
    instructions: ["杯中加冰", "倒入伏特加与咖啡利口酒", "缓缓铺上一层奶油（此处用糖浆替代示意）", "饮前轻搅"],
    recipe: [{ name: "伏特加", amount: "40ml" }, { name: "咖啡利口酒", amount: "20ml" }, { name: "糖浆", amount: "20ml" }],
  },
  {
    name: "含羞草", nameEn: "Mimosa", slug: "mimosa", category: "IBA-当代经典",
    flavorTags: ["果香", "清爽", "甜"], glassType: "笛形香槟杯", garnish: "无", difficulty: "easy",
    description: "早午餐的明星。气泡酒与橙汁等比相融，金黄色的气泡里满是阳光的味道。",
    instructions: ["香槟杯中先倒入冰镇橙汁", "缓缓注入气泡酒", "轻轻一搅即可"],
    recipe: [{ name: "气泡酒", amount: "75ml" }, { name: "橙汁", amount: "75ml" }],
  },
  {
    name: "西柚啤酒", nameEn: "Grapefruit Beer", slug: "grapefruit-beer", category: "便利店调酒",
    flavorTags: ["清爽", "果香", "顺口"], glassType: "啤酒杯", garnish: "西柚片", difficulty: "easy",
    description: "啤酒兑西柚汁，喝起来像果味啤酒，但比成品更清爽，酒味很淡、甜甜的，咕咚咕咚毫无压力。",
    instructions: ["杯中倒入冰镇啤酒", "加入西柚汁", "轻搅，西柚片装饰"],
    recipe: [{ name: "西柚汁", amount: "100ml" }, { name: "苏打水", amount: "100ml" }],
  },
  {
    name: "聚会潘趣", nameEn: "Party Punch", slug: "party-punch", category: "聚会桶酒",
    flavorTags: ["果香", "甜", "清爽"], glassType: "潘趣大碗", garnish: "时令水果", difficulty: "easy",
    description: "为聚会而生的大份量调饮。一次调一大桶，朗姆、果汁与气泡混合，自取自酌，热闹又省事。",
    instructions: ["大容器中混合白朗姆、菠萝汁、橙汁、蔓越莓汁", "加入大量冰块", "上桌前补入苏打水", "投入时令水果块"],
    recipe: [{ name: "白朗姆酒", amount: "300ml" }, { name: "菠萝汁", amount: "300ml" }, { name: "橙汁", amount: "200ml" }, { name: "蔓越莓汁", amount: "200ml" }, { name: "苏打水", amount: "400ml" }],
  },

  // =========================================================================
  // 权威 IBA 官方配方（按 IBA 2020 官方配比，原创品鉴文案）
  // 分类沿用 IBA 官方三类：难忘经典 / 当代经典 / 新时代创新
  // =========================================================================
  {
    name: "美国佬", nameEn: "Americano", slug: "americano", category: "IBA-难忘经典",
    flavorTags: ["苦", "清爽", "层次丰富"], glassType: "古典杯", garnish: "橙片与柠檬皮", difficulty: "easy",
    description: "尼格罗尼的前身，把烈酒换成了苏打水。金巴利与甜味美思等量交织出柑橘草本的微苦，气泡让整杯轻盈起来，是开胃酒的经典模样。",
    instructions: ["古典杯中加冰", "倒入金巴利与甜味美思", "补满苏打水，轻搅", "以橙片与柠檬皮装饰"],
    recipe: [{ name: "金巴利", amount: "30ml" }, { name: "甜味美思", amount: "30ml" }, { name: "苏打水", amount: "适量" }],
  },
  {
    name: "约翰柯林斯", nameEn: "John Collins", slug: "john-collins", category: "IBA-难忘经典",
    flavorTags: ["清爽", "酸", "甜"], glassType: "高球杯", garnish: "柠檬片与樱桃", difficulty: "easy",
    description: "金酒版的柠檬气泡长饮。柠檬与糖浆撑起酸甜骨架，苏打水拉长酒体，一滴苦精收尾，清爽得能喝一整个下午。",
    instructions: ["摇壶加冰，倒入金酒、柠檬汁、糖浆，摇匀", "滤入加冰的高球杯", "补满苏打水，滴入苦精", "以柠檬片与樱桃装饰"],
    recipe: [{ name: "金酒", amount: "45ml" }, { name: "柠檬汁", amount: "30ml" }, { name: "糖浆", amount: "15ml" }, { name: "苏打水", amount: "60ml" }, { name: "安格仕苦精", amount: "1 dash", optional: true }],
  },
  {
    name: "金菲士", nameEn: "Gin Fizz", slug: "gin-fizz", category: "IBA-难忘经典",
    flavorTags: ["清爽", "酸", "气泡"], glassType: "高球杯", garnish: "柠檬片", difficulty: "medium",
    description: "酸味家族里最爱冒泡的一员。金酒、柠檬与糖浆摇匀后注入苏打，绵密细泡裹着草本与柑橘，入口爽利清新。",
    instructions: ["摇壶加冰，倒入金酒、柠檬汁、糖浆", "充分摇匀", "滤入加冰的高球杯", "补满苏打水，以柠檬片装饰"],
    recipe: [{ name: "金酒", amount: "45ml" }, { name: "柠檬汁", amount: "30ml" }, { name: "糖浆", amount: "10ml" }, { name: "苏打水", amount: "80ml" }],
  },
  {
    name: "边车", nameEn: "Sidecar", slug: "sidecar", category: "IBA-难忘经典",
    flavorTags: ["酸", "果香", "厚重"], glassType: "马天尼杯", garnish: "糖圈与柠檬皮", difficulty: "medium",
    description: "禁酒令时代的优雅产物。干邑的果木温度、橙皮利口酒的明亮与柠檬的尖锐三者咬合，杯口一圈糖更添层次。",
    instructions: ["杯口可抹一圈糖备用", "摇壶加冰，倒入白兰地、橙皮利口酒、柠檬汁", "充分摇匀", "滤入冰镇杯，柠檬皮装饰"],
    recipe: [{ name: "白兰地", amount: "50ml" }, { name: "橙皮利口酒", amount: "20ml" }, { name: "柠檬汁", amount: "20ml" }],
  },
  {
    name: "白色佳人", nameEn: "White Lady", slug: "white-lady", category: "IBA-难忘经典",
    flavorTags: ["酸", "清爽", "顺口"], glassType: "马天尼杯", garnish: "柠檬皮", difficulty: "medium",
    description: "边车的金酒姊妹。金酒的草本被橙皮利口酒的甜与柠檬的酸包裹，可选的蛋清让口感更绵柔，明亮又不失骨架。",
    instructions: ["摇壶中倒入金酒、橙皮利口酒、柠檬汁（可加蛋清）", "如加蛋清先不加冰干摇起泡", "再加冰摇匀", "滤入冰镇杯，柠檬皮装饰"],
    recipe: [{ name: "金酒", amount: "40ml" }, { name: "橙皮利口酒", amount: "30ml" }, { name: "柠檬汁", amount: "20ml" }, { name: "蛋清", amount: "1个", optional: true }],
  },
  {
    name: "花花公子", nameEn: "Boulevardier", slug: "boulevardier", category: "IBA-难忘经典",
    flavorTags: ["苦", "厚重", "层次丰富"], glassType: "古典杯", garnish: "橙皮", difficulty: "easy",
    description: "尼格罗尼穿上威士忌外套。波本的甜润温暖中和了金巴利的苦，甜味美思牵线，醇厚而有大人味。",
    instructions: ["搅拌杯中加冰", "倒入波本、金巴利、甜味美思", "搅拌至冰凉", "滤入加冰古典杯，扭橙皮投入"],
    recipe: [{ name: "波本威士忌", amount: "30ml" }, { name: "金巴利", amount: "30ml" }, { name: "甜味美思", amount: "30ml" }],
  },
  {
    name: "维斯帕", nameEn: "Vesper", slug: "vesper", category: "IBA-难忘经典",
    flavorTags: ["厚重", "干冽", "顺口"], glassType: "马天尼杯", garnish: "柠檬皮", difficulty: "medium",
    description: "007 点单的那杯马天尼。金酒与伏特加叠出更冷冽的酒体，一抹利莱白带来柑橘与花蜜的余韵，干净利落。",
    instructions: ["摇壶加冰，倒入金酒、伏特加、利莱白", "充分摇匀至冰镇", "滤入冰镇马天尼杯", "扭柠檬皮释放精油后装饰"],
    recipe: [{ name: "金酒", amount: "60ml" }, { name: "伏特加", amount: "15ml" }, { name: "利莱白", amount: "7.5ml" }],
  },
  {
    name: "黑俄罗斯", nameEn: "Black Russian", slug: "black-russian", category: "IBA-当代经典",
    flavorTags: ["厚重", "甜", "顺口"], glassType: "古典杯", garnish: "无", difficulty: "easy",
    description: "只用两样东西就成立的经典。伏特加的干净底子上铺一层咖啡利口酒的浓甜，简单直接，餐后一杯刚刚好。",
    instructions: ["古典杯中加入冰块", "倒入伏特加", "缓缓注入咖啡利口酒", "饮前轻搅"],
    recipe: [{ name: "伏特加", amount: "50ml" }, { name: "咖啡利口酒", amount: "20ml" }],
  },
  {
    name: "龙舌兰日出", nameEn: "Tequila Sunrise", slug: "tequila-sunrise", category: "IBA-当代经典",
    flavorTags: ["果香", "甜"], glassType: "高球杯", garnish: "橙片与樱桃", difficulty: "easy",
    description: "杯中真的有一场日出。龙舌兰兑满橙汁，沉入杯底的红石榴糖浆缓缓晕染出橙红渐层，甜润讨喜，颜值满分。",
    instructions: ["高球杯加冰，倒入龙舌兰与橙汁，轻搅", "沿杯壁缓缓倒入红石榴糖浆，使其沉底", "静置形成渐层", "以橙片与樱桃装饰"],
    recipe: [{ name: "龙舌兰", amount: "45ml" }, { name: "橙汁", amount: "90ml" }, { name: "红石榴糖浆", amount: "15ml" }],
  },
  {
    name: "海风", nameEn: "Sea Breeze", slug: "sea-breeze", category: "IBA-当代经典",
    flavorTags: ["清爽", "果香", "酸"], glassType: "高球杯", garnish: "青柠角", difficulty: "easy",
    description: "海边度假的味道。伏特加几乎隐身，蔓越莓的酸涩与西柚的微苦交错，红粉色泽清爽宜人，咕咚几口就见底。",
    instructions: ["高球杯加满冰", "倒入伏特加", "补入蔓越莓汁与西柚汁", "轻搅，青柠角装饰"],
    recipe: [{ name: "伏特加", amount: "40ml" }, { name: "蔓越莓汁", amount: "120ml" }, { name: "西柚汁", amount: "30ml" }],
  },
  {
    name: "长岛冰茶", nameEn: "Long Island Iced Tea", slug: "long-island-iced-tea", category: "IBA-当代经典",
    flavorTags: ["厚重", "顺口", "果香"], glassType: "高球杯", garnish: "柠檬角", difficulty: "medium",
    description: "不含一滴茶，却像冰红茶一样好入口的危险存在。四种白色烈酒加橙皮利口酒，柠檬与可乐调出茶色，后劲十足。",
    instructions: ["高球杯加满冰", "依次倒入龙舌兰、伏特加、白朗姆、金酒、橙皮利口酒", "加入柠檬汁与糖浆，轻搅", "补满可乐，以柠檬角装饰"],
    recipe: [{ name: "龙舌兰", amount: "15ml" }, { name: "伏特加", amount: "15ml" }, { name: "白朗姆酒", amount: "15ml" }, { name: "金酒", amount: "15ml" }, { name: "橙皮利口酒", amount: "15ml" }, { name: "柠檬汁", amount: "25ml" }, { name: "糖浆", amount: "30ml" }, { name: "可乐", amount: "适量" }],
  },
  {
    name: "性感沙滩", nameEn: "Sex on the Beach", slug: "sex-on-the-beach", category: "IBA-当代经典",
    flavorTags: ["果香", "甜", "顺口"], glassType: "高球杯", garnish: "橙片", difficulty: "easy",
    description: "名字比味道更出名的派对常客。伏特加配蜜桃利口酒，蔓越莓与橙汁双果汁层层叠叠，甜美奔放，几乎尝不到酒精。",
    instructions: ["高球杯加满冰", "倒入伏特加与蜜桃利口酒", "补入蔓越莓汁与橙汁", "轻搅，橙片装饰"],
    recipe: [{ name: "伏特加", amount: "40ml" }, { name: "蜜桃利口酒", amount: "20ml" }, { name: "蔓越莓汁", amount: "40ml" }, { name: "橙汁", amount: "40ml" }],
  },
  {
    name: "僵尸", nameEn: "Zombie", slug: "zombie", category: "IBA-当代经典",
    flavorTags: ["厚重", "果香", "层次丰富"], glassType: "高球杯", garnish: "薄荷叶", difficulty: "hard",
    description: "提基酒文化的图腾，一杯能放倒人的烈性长饮。三种朗姆叠加法勒纳姆、肉桂与香料，复杂香气下藏着惊人的酒精度，浅尝即止。",
    instructions: ["摇壶加冰，倒入三种朗姆、青柠汁、法勒纳姆、西柚汁、肉桂糖浆、红石榴糖浆、苦精与苦艾酒", "短暂摇匀", "连冰倒入高球杯", "以薄荷叶装饰，插吸管"],
    recipe: [{ name: "白朗姆酒", amount: "45ml" }, { name: "黑朗姆酒", amount: "45ml" }, { name: "高度朗姆酒", amount: "30ml" }, { name: "青柠汁", amount: "20ml" }, { name: "法勒纳姆", amount: "15ml" }, { name: "西柚汁", amount: "10ml" }, { name: "肉桂糖浆", amount: "10ml" }, { name: "红石榴糖浆", amount: "10ml" }, { name: "安格仕苦精", amount: "1 dash" }, { name: "苦艾酒", amount: "少量" }],
  },
  {
    name: "帕洛玛", nameEn: "Paloma", slug: "paloma", category: "IBA-新时代创新",
    flavorTags: ["清爽", "果香", "微咸"], glassType: "高球杯", garnish: "青柠角", difficulty: "easy",
    description: "墨西哥比玛格丽特更日常的国民饮品。龙舌兰兑满西柚汽水，一撮盐提亮，气泡清爽中带着西柚的微苦回甘。",
    instructions: ["高球杯加冰，可先抹一圈盐", "倒入龙舌兰，挤入少许青柠汁", "补满西柚味汽水", "轻搅，青柠角装饰"],
    recipe: [{ name: "龙舌兰", amount: "50ml" }, { name: "西柚味汽水", amount: "100ml" }, { name: "青柠汁", amount: "10ml" }, { name: "盐", amount: "适量", optional: true }],
  },

  // =========================================================================
  // 更多权威经典（取自公开出版的经典配方：Savoy / Difford's / Death & Co 等，
  // 仅录有定本的款式，店主自创特调不录）
  // =========================================================================
  {
    name: "嗨棒", nameEn: "Highball", slug: "highball", category: "畅爽气泡 (The Highball Family)",
    flavorTags: ["清爽", "顺口", "气泡"], glassType: "高球杯", garnish: "柠檬皮", difficulty: "easy",
    description: "日式酒吧的国民长饮。冰镇威士忌兑足量苏打，讲究的是冰、气泡与轻盈，越简单越见功力。",
    instructions: ["高球杯装满冰，搅凉后倒掉融水", "倒入威士忌，再补一次冰", "沿杯壁缓缓注入苏打水", "轻提一下吧勺，柠檬皮装饰"],
    recipe: [{ name: "威士忌", amount: "45ml" }, { name: "苏打水", amount: "120ml" }],
  },
  {
    name: "斯普莫尼", nameEn: "Spumoni", slug: "spumoni", category: "畅爽气泡 (The Highball Family)",
    flavorTags: ["苦", "清爽", "果香"], glassType: "高球杯", garnish: "西柚皮", difficulty: "easy",
    description: "意大利的西柚版美国佬。金巴利的微苦遇上西柚汁的清新，再以汤力水拉长，苦甜爽口，开胃一流。",
    instructions: ["高球杯加满冰", "倒入金巴利与西柚汁", "补满汤力水", "轻搅，西柚皮装饰"],
    recipe: [{ name: "金巴利", amount: "30ml" }, { name: "西柚汁", amount: "90ml" }, { name: "汤力水", amount: "60ml" }],
  },
  {
    name: "法兰西75", nameEn: "French 75", slug: "french-75", category: "IBA-当代经典",
    flavorTags: ["清爽", "酸", "气泡"], glassType: "笛形香槟杯", garnish: "柠檬皮", difficulty: "medium",
    description: "以一战火炮命名的香槟鸡尾酒。金酒与柠檬的酸甜被气泡酒托起，明亮锐利，气场十足。",
    instructions: ["摇壶加冰，倒入金酒、柠檬汁、糖浆，摇匀", "滤入冰镇香槟杯", "补满气泡酒", "扭柠檬皮装饰"],
    recipe: [{ name: "金酒", amount: "30ml" }, { name: "柠檬汁", amount: "15ml" }, { name: "糖浆", amount: "15ml" }, { name: "气泡酒", amount: "60ml" }],
  },
  {
    name: "莫斯科骡子", nameEn: "Moscow Mule", slug: "moscow-mule", category: "IBA-当代经典",
    flavorTags: ["清爽", "微辣", "顺口"], glassType: "铜杯", garnish: "青柠角", difficulty: "easy",
    description: "盛在铜杯里的辛辣气泡。伏特加打底，姜啤的辣与青柠的酸让整杯生机勃勃，冰爽过瘾。",
    instructions: ["铜杯或高球杯加满冰", "挤入青柠汁，倒入伏特加", "补满姜啤", "轻搅，青柠角装饰"],
    recipe: [{ name: "伏特加", amount: "45ml" }, { name: "青柠汁", amount: "15ml" }, { name: "姜啤", amount: "120ml" }],
  },
  {
    name: "加里波第", nameEn: "Garibaldi", slug: "garibaldi", category: "馥郁果香 (The Fruity & Tropical Family)",
    flavorTags: ["果香", "苦", "顺口"], glassType: "高球杯", garnish: "橙片", difficulty: "easy",
    description: "“把金巴利和橙汁连接起来”的两材料经典。关键在于把橙汁打到蓬松起泡，苦甜交融、口感绵密。",
    instructions: ["将橙汁高速打发至蓬松", "高球杯加满冰，倒入金巴利", "缓缓注入打发橙汁", "橙片装饰"],
    recipe: [{ name: "金巴利", amount: "45ml" }, { name: "橙汁", amount: "120ml" }],
  },
  {
    name: "丛林鸟", nameEn: "Jungle Bird", slug: "jungle-bird", category: "馥郁果香 (The Fruity & Tropical Family)",
    flavorTags: ["果香", "苦", "层次丰富"], glassType: "古典杯", garnish: "菠萝叶", difficulty: "medium",
    description: "1978 年诞生于吉隆坡的提基经典，提基复兴的宠儿。黑朗姆与菠萝的甜被金巴利的苦切开，热带却不腻。",
    instructions: ["摇壶加冰，倒入黑朗姆、金巴利、菠萝汁、青柠汁、糖浆", "充分摇匀", "滤入加冰古典杯", "菠萝叶装饰"],
    recipe: [{ name: "黑朗姆酒", amount: "45ml" }, { name: "金巴利", amount: "18ml" }, { name: "菠萝汁", amount: "45ml" }, { name: "青柠汁", amount: "15ml" }, { name: "糖浆", amount: "15ml" }],
  },
  {
    name: "止痛药", nameEn: "Painkiller", slug: "painkiller", category: "馥郁果香 (The Fruity & Tropical Family)",
    flavorTags: ["甜", "果香", "厚重"], glassType: "高球杯", garnish: "肉豆蔻粉", difficulty: "easy",
    description: "加勒比的热带解暑良方。黑朗姆裹着菠萝、橙与椰子奶油，绵密香甜，最后撒一层肉豆蔻提香。",
    instructions: ["摇壶加冰，倒入黑朗姆、菠萝汁、橙汁、椰子奶油", "充分摇匀", "倒入装满碎冰的杯中", "撒肉豆蔻粉装饰"],
    recipe: [{ name: "黑朗姆酒", amount: "60ml" }, { name: "菠萝汁", amount: "120ml" }, { name: "橙汁", amount: "30ml" }, { name: "椰子奶油", amount: "30ml" }],
  },
  {
    name: "椰林飘香", nameEn: "Piña Colada", slug: "pina-colada", category: "IBA-当代经典",
    flavorTags: ["甜", "果香", "顺口"], glassType: "飓风杯", garnish: "菠萝片与樱桃", difficulty: "easy",
    description: "波多黎各的国民鸡尾酒。白朗姆、菠萝与椰子奶油搅打成绵密冰沙，一口就是海岛的阳光与椰林。",
    instructions: ["搅拌机中加入白朗姆、椰子奶油、菠萝汁与一杯碎冰", "高速搅打至顺滑", "倒入飓风杯", "菠萝片与樱桃装饰"],
    recipe: [{ name: "白朗姆酒", amount: "50ml" }, { name: "椰子奶油", amount: "30ml" }, { name: "菠萝汁", amount: "90ml" }],
  },
  {
    name: "迈泰", nameEn: "Mai Tai", slug: "mai-tai", category: "IBA-当代经典",
    flavorTags: ["果香", "层次丰富", "厚重"], glassType: "古典杯", garnish: "薄荷与青柠", difficulty: "medium",
    description: "提基鸡尾酒的王者。陈年朗姆、橙皮利口酒与杏仁糖浆在青柠的酸里展开，坚果与柑橘的香气层层堆叠。",
    instructions: ["摇壶加碎冰，倒入黑朗姆、橙皮利口酒、杏仁糖浆、青柠汁", "短暂摇匀", "连冰倒入古典杯", "薄荷与青柠壳装饰"],
    recipe: [{ name: "黑朗姆酒", amount: "40ml" }, { name: "橙皮利口酒", amount: "15ml" }, { name: "杏仁糖浆", amount: "15ml" }, { name: "青柠汁", amount: "30ml" }],
  },
  {
    name: "斗牛士", nameEn: "Matador", slug: "matador", category: "馥郁果香 (The Fruity & Tropical Family)",
    flavorTags: ["果香", "酸", "清爽"], glassType: "古典杯", garnish: "菠萝角", difficulty: "easy",
    description: "龙舌兰的热带短打。菠萝汁的浓甜与青柠的酸把龙舌兰的青草气衬得明快，简单却很讨喜。",
    instructions: ["摇壶加冰，倒入龙舌兰、菠萝汁、青柠汁", "摇匀", "滤入加冰古典杯", "菠萝角装饰"],
    recipe: [{ name: "龙舌兰", amount: "45ml" }, { name: "菠萝汁", amount: "60ml" }, { name: "青柠汁", amount: "15ml" }],
  },
  {
    name: "内华达", nameEn: "Nevada", slug: "nevada", category: "清新酸甜 (The Sour Family)",
    flavorTags: ["果香", "酸", "顺口"], glassType: "马天尼杯", garnish: "西柚皮", difficulty: "medium",
    description: "朗姆与西柚的复古酸饮。西柚的微苦、青柠的尖酸与一滴苦精交织，圆润中带着清爽尾韵。",
    instructions: ["摇壶加冰，倒入白朗姆、西柚汁、青柠汁、糖浆、苦精", "充分摇匀", "滤入冰镇杯", "西柚皮装饰"],
    recipe: [{ name: "白朗姆酒", amount: "45ml" }, { name: "西柚汁", amount: "30ml" }, { name: "青柠汁", amount: "15ml" }, { name: "糖浆", amount: "10ml" }, { name: "安格仕苦精", amount: "1 dash" }],
  },
  {
    name: "破冰船", nameEn: "Ice Breaker", slug: "ice-breaker", category: "馥郁果香 (The Fruity & Tropical Family)",
    flavorTags: ["果香", "酸", "甜"], glassType: "古典杯", garnish: "西柚皮", difficulty: "medium",
    description: "龙舌兰与西柚的冰爽碰撞。橙皮利口酒添香，红石榴糖浆点染粉色，是一杯色香味俱佳的破冰之选。",
    instructions: ["搅拌机或摇壶加碎冰", "倒入龙舌兰、橙皮利口酒、西柚汁、红石榴糖浆", "搅打或摇匀", "倒入古典杯，西柚皮装饰"],
    recipe: [{ name: "龙舌兰", amount: "30ml" }, { name: "橙皮利口酒", amount: "15ml" }, { name: "西柚汁", amount: "30ml" }, { name: "红石榴糖浆", amount: "10ml" }],
  },
  {
    name: "金蕾", nameEn: "Gimlet", slug: "gimlet", category: "清新酸甜 (The Sour Family)",
    flavorTags: ["酸", "清爽", "顺口"], glassType: "马天尼杯", garnish: "青柠片", difficulty: "easy",
    description: "海军时代留下的极简经典。金酒与青柠甜浆，酸甜利落，干净得只剩下金酒的草本与青柠的清香。",
    instructions: ["摇壶加冰，倒入金酒与青柠甜浆", "充分摇匀至冰镇", "滤入冰镇杯", "青柠片装饰"],
    recipe: [{ name: "金酒", amount: "60ml" }, { name: "青柠甜浆", amount: "15ml" }],
  },
  {
    name: "沉默第三者", nameEn: "Silent Third", slug: "silent-third", category: "清新酸甜 (The Sour Family)",
    flavorTags: ["酸", "层次丰富", "顺口"], glassType: "马天尼杯", garnish: "柠檬皮", difficulty: "medium",
    description: "苏格兰威士忌版的边车。烟熏谷物的底色被橙皮利口酒的甜与柠檬的酸唤醒，酸甜之间藏着威士忌的厚度。",
    instructions: ["摇壶加冰，倒入威士忌、橙皮利口酒、柠檬汁", "充分摇匀", "滤入冰镇杯", "柠檬皮装饰"],
    recipe: [{ name: "威士忌", amount: "40ml" }, { name: "橙皮利口酒", amount: "20ml" }, { name: "柠檬汁", amount: "20ml" }],
  },
  {
    name: "最后结局", nameEn: "XYZ", slug: "xyz", category: "清新酸甜 (The Sour Family)",
    flavorTags: ["酸", "清爽", "果香"], glassType: "马天尼杯", garnish: "柠檬皮", difficulty: "easy",
    description: "字母表的终点，也是朗姆酸味的范本。白朗姆、橙皮利口酒与柠檬的三角配比，清爽利落，被称作“朗姆界的边车”。",
    instructions: ["摇壶加冰，倒入白朗姆、橙皮利口酒、柠檬汁", "充分摇匀", "滤入冰镇杯", "柠檬皮装饰"],
    recipe: [{ name: "白朗姆酒", amount: "45ml" }, { name: "橙皮利口酒", amount: "20ml" }, { name: "柠檬汁", amount: "20ml" }],
  },
  {
    name: "茉莉", nameEn: "Jasmine", slug: "jasmine", category: "清新酸甜 (The Sour Family)",
    flavorTags: ["苦", "酸", "果香"], glassType: "马天尼杯", garnish: "柠檬皮", difficulty: "medium",
    description: "90 年代诞生的现代经典，被誉为“喝起来像西柚的金巴利”。金酒为骨，金巴利与橙皮利口酒交织，苦甜酸俱全，粉橘色泽迷人。",
    instructions: ["摇壶加冰，倒入金酒、橙皮利口酒、金巴利、柠檬汁", "充分摇匀", "滤入冰镇杯", "柠檬皮装饰"],
    recipe: [{ name: "金酒", amount: "45ml" }, { name: "橙皮利口酒", amount: "15ml" }, { name: "金巴利", amount: "7.5ml" }, { name: "柠檬汁", amount: "15ml" }],
  },
  {
    name: "布朗克斯", nameEn: "Bronx", slug: "bronx", category: "醇厚烈酒 (The Spirit-Forward Family)",
    flavorTags: ["果香", "层次丰富", "顺口"], glassType: "马天尼杯", garnish: "橙皮", difficulty: "medium",
    description: "曾与马天尼、曼哈顿并列的纽约老派经典。金酒配干甜两种味美思，再加一抹橙汁，干爽中透出柑橘的圆润。",
    instructions: ["摇壶加冰，倒入金酒、干味美思、甜味美思、橙汁", "摇匀", "滤入冰镇杯", "橙皮装饰"],
    recipe: [{ name: "金酒", amount: "45ml" }, { name: "干味美思", amount: "15ml" }, { name: "甜味美思", amount: "15ml" }, { name: "橙汁", amount: "15ml" }],
  },
  {
    name: "罗西塔", nameEn: "Rosita", slug: "rosita", category: "醇厚烈酒 (The Spirit-Forward Family)",
    flavorTags: ["苦", "厚重", "层次丰富"], glassType: "古典杯", garnish: "柠檬皮", difficulty: "medium",
    description: "龙舌兰版的尼格罗尼，由调酒名家 Gary Regan 发扬。龙舌兰、金巴利与双味美思层层叠加，苦甜厚重，回味悠长。",
    instructions: ["搅拌杯加冰，倒入龙舌兰、金巴利、甜味美思、干味美思、苦精", "搅拌至冰凉", "滤入加冰古典杯", "柠檬皮装饰"],
    recipe: [{ name: "龙舌兰", amount: "45ml" }, { name: "金巴利", amount: "15ml" }, { name: "甜味美思", amount: "15ml" }, { name: "干味美思", amount: "15ml" }, { name: "安格仕苦精", amount: "2 dash" }],
  },
  {
    name: "小公主", nameEn: "Little Princess", slug: "little-princess", category: "醇厚烈酒 (The Spirit-Forward Family)",
    flavorTags: ["厚重", "甜", "顺口"], glassType: "马天尼杯", garnish: "无", difficulty: "easy",
    description: "朗姆版的曼哈顿雏形。白朗姆与甜味美思等量相融，简单两味却柔顺甘醇，是被低估的搅拌类经典。",
    instructions: ["搅拌杯加冰，倒入白朗姆与甜味美思", "搅拌至充分冰镇", "滤入冰镇杯"],
    recipe: [{ name: "白朗姆酒", amount: "45ml" }, { name: "甜味美思", amount: "45ml" }],
  },
  {
    name: "亲密关系", nameEn: "Affinity", slug: "affinity", category: "醇厚烈酒 (The Spirit-Forward Family)",
    flavorTags: ["厚重", "层次丰富", "苦"], glassType: "马天尼杯", garnish: "酒渍樱桃", difficulty: "medium",
    description: "苏格兰版的完美马天尼。威士忌与干甜味美思各半，苦精串起烟熏与草本，沉稳内敛，越喝越有味。",
    instructions: ["搅拌杯加冰，倒入威士忌、干味美思、甜味美思、苦精", "搅拌至冰凉", "滤入冰镇杯", "酒渍樱桃装饰"],
    recipe: [{ name: "威士忌", amount: "30ml" }, { name: "干味美思", amount: "30ml" }, { name: "甜味美思", amount: "30ml" }, { name: "安格仕苦精", amount: "2 dash" }],
  },
  {
    name: "教父", nameEn: "Godfather", slug: "godfather", category: "IBA-当代经典",
    flavorTags: ["厚重", "甜", "层次丰富"], glassType: "古典杯", garnish: "无", difficulty: "easy",
    description: "两味成就的醇厚经典。威士忌的烟熏与阿玛雷托的杏仁甜香交织，简单到极致，却是餐后小酌的稳妥之选。",
    instructions: ["古典杯加入大冰块", "倒入威士忌与阿玛雷托", "轻搅至冰凉"],
    recipe: [{ name: "威士忌", amount: "45ml" }, { name: "阿玛雷托", amount: "15ml" }],
  },
];

// ---------------------------------------------------------------------------
// Knowledge base articles (original copy, Markdown)
// ---------------------------------------------------------------------------
const articles: { title: string; slug: string; category: string; content: string }[] = [
  {
    title: "新手必备：在家调酒的五件工具", slug: "starter-tools", category: "调酒技巧",
    content: "# 新手必备：在家调酒的五件工具\n\n刚开始在家调酒，不需要一次买齐整套吧台。先备好这五样，就能做出大多数经典：\n\n1. **摇酒壶 (Shaker)**：含果汁、蛋清的酒款都靠它摇匀降温。\n2. **量酒器 (Jigger)**：配比是鸡尾酒的灵魂，别凭感觉倒。\n3. **吧勺 (Bar Spoon)**：搅拌类酒款用，细长好控制。\n4. **滤冰器 (Strainer)**：把碎冰和果肉挡在杯外。\n5. **捣棒 (Muddler)**：压出薄荷、水果的香气。\n\n工具到位后，剩下的就是练手感。",
  },
  {
    title: "摇和搅，到底什么时候用哪种", slug: "shake-vs-stir", category: "调酒技巧",
    content: "# 摇还是搅？\n\n一个简单原则：\n\n- **含果汁、蛋清、奶油** 的酒款要**摇**，因为需要充分乳化、起泡、快速降温。\n- **只含烈酒和利口酒**（如马天尼、曼哈顿、尼格罗尼）的酒款要**搅**，保持酒体清澈顺滑。\n\n摇的时候要果断有力，10-15 秒即可；搅则讲究耐心，沿杯壁匀速转动 20 秒左右。",
  },
  {
    title: "认识六大基酒", slug: "six-base-spirits", category: "基酒知识",
    content: "# 六大基酒\n\n几乎所有经典鸡尾酒都建立在这六种烈酒之上：\n\n- **金酒**：杜松子主导的草本气息。\n- **威士忌**：谷物陈酿，烟熏与香草。\n- **伏特加**：中性干净，百搭。\n- **朗姆酒**：甘蔗酿造，从清爽到醇厚都有。\n- **龙舌兰**：青草与泥土，墨西哥的味道。\n- **白兰地**：葡萄蒸馏，温暖果香。\n\n了解它们的性格，就能预判一杯酒大致的走向。",
  },
  {
    title: "糖浆的做法与保存", slug: "simple-syrup", category: "原料知识",
    content: "# 自制糖浆\n\n糖浆是甜味最通用的来源。\n\n**1:1 糖浆**：白砂糖与水等重，小火加热搅拌至溶解即可，清爽通用。\n\n**2:1 糖浆**：两份糖一份水，更浓更稠，用量更省、保存更久。\n\n装入干净密封瓶冷藏，一般可存两到三周。想要风味，可在熬制时加入香草、迷迭香或柑橘皮。",
  },
  {
    title: "杯型怎么选", slug: "glassware-guide", category: "杯具介绍",
    content: "# 常见杯型\n\n- **古典杯 (Old Fashioned)**：矮胖厚实，适合加大冰块的烈酒类。\n- **高球杯 (Highball)**：细长，长饮与气泡类首选。\n- **马天尼杯 (Coupe/Martini)**：无冰短饮，凸显酒体与香气。\n- **笛形杯 (Flute)**：留住气泡，香槟类专用。\n\n杯型不只是好看，它影响香气聚集、冰量与饮用节奏。",
  },
];

async function main() {
  console.log("🌱 Seeding...");

  // Admin demo account
  const adminPassword = await bcrypt.hash("admin12345", 10);
  await prisma.user.upsert({
    where: { email: "admin@cocktail.local" },
    update: {},
    create: {
      email: "admin@cocktail.local",
      password: adminPassword,
      name: "管理员",
      role: "admin",
      mode: "drinker",
    },
  });

  // Ingredients
  const ingredientMap = new Map<string, string>();
  for (const ing of ingredients) {
    const created = await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {
        nameEn: ing.nameEn,
        type: ing.type,
        abv: ing.abv ?? null,
        description: ing.description ?? null,
      },
      create: {
        name: ing.name,
        nameEn: ing.nameEn,
        type: ing.type,
        abv: ing.abv ?? null,
        description: ing.description ?? null,
      },
    });
    ingredientMap.set(ing.name, created.id);
  }
  console.log(`  ✓ ${ingredients.length} ingredients`);

  // Cocktails + relations
  for (const c of cocktails) {
    const created = await prisma.cocktail.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name, nameEn: c.nameEn, category: c.category,
        flavorTags: arr(c.flavorTags), glassType: c.glassType, garnish: c.garnish,
        description: c.description, instructions: arr(c.instructions),
        difficulty: c.difficulty, isPublished: true,
      },
      create: {
        name: c.name, nameEn: c.nameEn, slug: c.slug, category: c.category,
        flavorTags: arr(c.flavorTags), glassType: c.glassType, garnish: c.garnish,
        description: c.description, instructions: arr(c.instructions),
        difficulty: c.difficulty, isPublished: true,
      },
    });
    // reset relations for idempotency
    await prisma.cocktailIngredient.deleteMany({ where: { cocktailId: created.id } });
    let order = 0;
    for (const r of c.recipe) {
      const ingredientId = ingredientMap.get(r.name);
      if (!ingredientId) {
        console.warn(`  ! missing ingredient "${r.name}" for ${c.name}`);
        continue;
      }
      await prisma.cocktailIngredient.create({
        data: {
          cocktailId: created.id,
          ingredientId,
          amount: r.amount,
          isOptional: r.optional ?? false,
          sortOrder: order++,
        },
      });
    }
  }
  console.log(`  ✓ ${cocktails.length} cocktails`);

  // Articles
  for (const a of articles) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: { title: a.title, content: a.content, category: a.category, isPublished: true },
      create: { title: a.title, slug: a.slug, content: a.content, category: a.category, isPublished: true },
    });
  }
  console.log(`  ✓ ${articles.length} articles`);

  console.log("✅ Seed complete. Admin: admin@cocktail.local / admin12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
