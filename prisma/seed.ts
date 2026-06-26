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
