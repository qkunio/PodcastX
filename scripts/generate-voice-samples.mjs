import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const TTS_URL = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional';
const CODE_AUDIO_CHUNK = 0;
const CODE_SUCCESS = 20000000;
const DEFAULT_TEXT = '\u4f60\u597d\u5440\uff0c\u6211\u662f\u8c46\u5305\uff0c\u4eca\u5929\u8fc7\u5f97\u600e\u4e48\u6837\uff0c\u53ef\u4ee5\u5206\u4eab\u4e00\u4e0b\u5417\uff1f';
const DEFAULT_RESOURCE_ID = 'seed-tts-2.0';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const VOICE_TYPES = [
  'zh_female_vv_uranus_bigtts',
  'zh_female_xiaohe_uranus_bigtts',
  'zh_male_m191_uranus_bigtts',
  'zh_male_taocheng_uranus_bigtts',
  'zh_male_liufei_uranus_bigtts',
  'zh_female_sophie_uranus_bigtts',
  'zh_female_qingxinnvsheng_uranus_bigtts',
  'zh_female_cancan_uranus_bigtts',
  'zh_female_sajiaoxuemei_uranus_bigtts',
  'zh_female_tianmeixiaoyuan_uranus_bigtts',
  'zh_female_tianmeitaozi_uranus_bigtts',
  'zh_female_shuangkuaisisi_uranus_bigtts',
  'zh_female_peiqi_uranus_bigtts',
  'zh_female_linjianvhai_uranus_bigtts',
  'zh_male_shaonianzixin_uranus_bigtts',
  'zh_male_sunwukong_uranus_bigtts',
  'zh_female_yingyujiaoxue_uranus_bigtts',
  'zh_female_kefunvsheng_uranus_bigtts',
  'zh_female_xiaoxue_uranus_bigtts',
  'zh_male_dayi_uranus_bigtts',
  'zh_female_mizai_uranus_bigtts',
  'zh_female_jitangnv_uranus_bigtts',
  'zh_female_meilinvyou_uranus_bigtts',
  'zh_female_liuchangnv_uranus_bigtts',
  'zh_male_ruyayichen_uranus_bigtts',
  'en_male_tim_uranus_bigtts',
  'en_female_dacey_uranus_bigtts',
  'en_female_stokie_uranus_bigtts',
  'zh_female_wenroumama_uranus_bigtts',
  'zh_male_jieshuoxiaoming_uranus_bigtts',
  'zh_female_tvbnv_uranus_bigtts',
  'zh_male_yizhipiannan_uranus_bigtts',
  'zh_female_qiaopinv_uranus_bigtts',
  'zh_female_zhishuaiyingzi_uranus_bigtts',
  'zh_male_linjiananhai_uranus_bigtts',
  'zh_male_silang_uranus_bigtts',
  'zh_male_ruyaqingnian_uranus_bigtts',
  'zh_male_qingcang_uranus_bigtts',
  'zh_male_xionger_uranus_bigtts',
  'zh_female_yingtaowanzi_uranus_bigtts',
  'zh_male_wennuanahu_uranus_bigtts',
  'zh_male_naiqimengwa_uranus_bigtts',
  'zh_female_popo_uranus_bigtts',
  'zh_female_gaolengyujie_uranus_bigtts',
  'zh_male_aojiaobazong_uranus_bigtts',
  'zh_male_lanyinmianbao_uranus_bigtts',
  'zh_male_fanjuanqingnian_uranus_bigtts',
  'zh_female_wenroushunv_uranus_bigtts',
  'zh_female_gufengshaoyu_uranus_bigtts',
  'zh_male_huolixiaoge_uranus_bigtts',
  'zh_male_baqiqingshu_uranus_bigtts',
  'zh_male_xuanyijieshuo_uranus_bigtts',
  'zh_female_mengyatou_uranus_bigtts',
  'zh_female_tiexinnvsheng_uranus_bigtts',
  'zh_female_jitangmei_uranus_bigtts',
  'zh_male_cixingjieshuonan_uranus_bigtts',
  'zh_male_liangsangmengzai_uranus_bigtts',
  'zh_female_kailangjiejie_uranus_bigtts',
  'zh_male_gaolengchenwen_uranus_bigtts',
  'zh_male_shenyeboke_uranus_bigtts',
  'zh_male_lubanqihao_uranus_bigtts',
  'zh_female_jiaochuannv_uranus_bigtts',
  'zh_female_linxiao_uranus_bigtts',
  'zh_female_lingling_uranus_bigtts',
  'zh_female_chunribu_uranus_bigtts',
  'zh_male_tangseng_uranus_bigtts',
  'zh_male_zhuangzhou_uranus_bigtts',
  'zh_male_kailangdidi_uranus_bigtts',
  'zh_male_zhubajie_uranus_bigtts',
  'zh_female_ganmaodianyin_uranus_bigtts',
  'zh_female_chanmeinv_uranus_bigtts',
  'zh_female_nvleishen_uranus_bigtts',
  'zh_female_qinqienv_uranus_bigtts',
  'zh_male_kuailexiaodong_uranus_bigtts',
  'zh_male_kailangxuezhang_uranus_bigtts',
  'zh_male_youyoujunzi_uranus_bigtts',
  'zh_female_wenjingmaomao_uranus_bigtts',
  'zh_female_zhixingnv_uranus_bigtts',
  'zh_male_qingshuangnanda_uranus_bigtts',
  'zh_male_yuanboxiaoshu_uranus_bigtts',
  'zh_male_yangguangqingnian_uranus_bigtts',
  'zh_female_qingchezizi_uranus_bigtts',
  'zh_female_tianmeiyueyue_uranus_bigtts',
  'zh_female_xinlingjitang_uranus_bigtts',
  'zh_male_wenrouxiaoge_uranus_bigtts',
  'zh_female_roumeinvyou_uranus_bigtts',
  'zh_male_dongfanghaoran_uranus_bigtts',
  'zh_female_wenrouxiaoya_uranus_bigtts',
  'zh_male_tiancaitongsheng_uranus_bigtts',
  'zh_female_wuzetian_uranus_bigtts',
  'zh_female_gujie_uranus_bigtts',
  'zh_male_guanggaojieshuo_uranus_bigtts',
  'zh_female_shaoergushi_uranus_bigtts',
  'saturn_zh_female_tiaopigongzhu_tob',
  'saturn_zh_female_keainvsheng_tob',
  'saturn_zh_male_shuanglangshaonian_tob',
  'saturn_zh_male_tiancaitongzhuo_tob',
  'saturn_zh_female_cancan_tob',
  'saturn_zh_female_qingyingduoduo_cs_tob',
  'saturn_zh_female_wenwanshanshan_cs_tob',
  'saturn_zh_female_reqingaina_cs_tob',
  'saturn_zh_male_qingxinmumu_cs_tob',
];

const VOICE_NAMES = {
  zh_female_vv_uranus_bigtts: 'Vivi 2.0',
  zh_female_xiaohe_uranus_bigtts: '\u5c0f\u4f55 2.0',
  zh_male_m191_uranus_bigtts: '\u4e91\u821f 2.0',
  zh_male_taocheng_uranus_bigtts: '\u5c0f\u5929 2.0',
  zh_male_liufei_uranus_bigtts: '\u5218\u98de 2.0',
  zh_female_sophie_uranus_bigtts: '\u9b45\u529b\u82cf\u83f2 2.0',
  zh_female_qingxinnvsheng_uranus_bigtts: '\u6e05\u65b0\u5973\u58f0 2.0',
  zh_female_cancan_uranus_bigtts: '\u77e5\u6027\u707f\u707f 2.0',
  zh_female_sajiaoxuemei_uranus_bigtts: '\u6492\u5a07\u5b66\u59b9 2.0',
  zh_female_tianmeixiaoyuan_uranus_bigtts: '\u751c\u7f8e\u5c0f\u6e90 2.0',
  zh_female_tianmeitaozi_uranus_bigtts: '\u751c\u7f8e\u6843\u5b50 2.0',
  zh_female_shuangkuaisisi_uranus_bigtts: '\u723d\u5feb\u601d\u601d 2.0',
  zh_female_peiqi_uranus_bigtts: '\u4f69\u5947\u732a 2.0',
  zh_female_linjianvhai_uranus_bigtts: '\u90bb\u5bb6\u5973\u5b69 2.0',
  zh_male_shaonianzixin_uranus_bigtts: '\u5c11\u5e74\u6893\u8f9b Brayan 2.0',
  zh_male_sunwukong_uranus_bigtts: '\u7334\u54e5 2.0',
  zh_female_yingyujiaoxue_uranus_bigtts: 'Tina\u8001\u5e08 2.0',
  zh_female_kefunvsheng_uranus_bigtts: '\u6696\u9633\u5973\u58f0 2.0',
  zh_female_xiaoxue_uranus_bigtts: '\u513f\u7ae5\u7ed8\u672c 2.0',
  zh_male_dayi_uranus_bigtts: '\u5927\u58f9 2.0',
  zh_female_mizai_uranus_bigtts: '\u9ed1\u732b\u4fa6\u63a2\u793e\u54aa\u4ed4 2.0',
  zh_female_jitangnv_uranus_bigtts: '\u9e21\u6c64\u5973 2.0',
  zh_female_meilinvyou_uranus_bigtts: '\u9b45\u529b\u5973\u53cb 2.0',
  zh_female_liuchangnv_uranus_bigtts: '\u6d41\u7545\u5973\u58f0 2.0',
  zh_male_ruyayichen_uranus_bigtts: '\u5112\u96c5\u9038\u8fb0 2.0',
  en_male_tim_uranus_bigtts: 'Tim',
  en_female_dacey_uranus_bigtts: 'Dacey',
  en_female_stokie_uranus_bigtts: 'Stokie',
  zh_female_wenroumama_uranus_bigtts: '\u6e29\u67d4\u5988\u5988 2.0',
  zh_male_jieshuoxiaoming_uranus_bigtts: '\u89e3\u8bf4\u5c0f\u660e 2.0',
  zh_female_tvbnv_uranus_bigtts: 'TVB\u5973\u58f0 2.0',
  zh_male_yizhipiannan_uranus_bigtts: '\u8bd1\u5236\u7247\u7537 2.0',
  zh_female_qiaopinv_uranus_bigtts: '\u4fcf\u76ae\u5973\u58f0 2.0',
  zh_female_zhishuaiyingzi_uranus_bigtts: '\u76f4\u7387\u82f1\u5b50 2.0',
  zh_male_linjiananhai_uranus_bigtts: '\u90bb\u5bb6\u7537\u5b69 2.0',
  zh_male_silang_uranus_bigtts: '\u56db\u90ce 2.0',
  zh_male_ruyaqingnian_uranus_bigtts: '\u5112\u96c5\u9752\u5e74 2.0',
  zh_male_qingcang_uranus_bigtts: '\u64ce\u82cd 2.0',
  zh_male_xionger_uranus_bigtts: '\u718a\u4e8c 2.0',
  zh_female_yingtaowanzi_uranus_bigtts: '\u6a31\u6843\u4e38\u5b50 2.0',
  zh_male_wennuanahu_uranus_bigtts: '\u6e29\u6696\u963f\u864e Alvin 2.0',
  zh_male_naiqimengwa_uranus_bigtts: '\u5976\u6c14\u840c\u5a03 2.0',
  zh_female_popo_uranus_bigtts: '\u5a46\u5a46 2.0',
  zh_female_gaolengyujie_uranus_bigtts: '\u9ad8\u51b7\u5fa1\u59d0 2.0',
  zh_male_aojiaobazong_uranus_bigtts: '\u50b2\u5a07\u9738\u603b 2.0',
  zh_male_lanyinmianbao_uranus_bigtts: '\u61d2\u97f3\u7ef5\u5b9d 2.0',
  zh_male_fanjuanqingnian_uranus_bigtts: '\u53cd\u5377\u9752\u5e74 2.0',
  zh_female_wenroushunv_uranus_bigtts: '\u6e29\u67d4\u6dd1\u5973 2.0',
  zh_female_gufengshaoyu_uranus_bigtts: '\u53e4\u98ce\u5c11\u5fa1 2.0',
  zh_male_huolixiaoge_uranus_bigtts: '\u6d3b\u529b\u5c0f\u54e5 2.0',
  zh_male_baqiqingshu_uranus_bigtts: '\u9738\u6c14\u9752\u53d4 2.0',
  zh_male_xuanyijieshuo_uranus_bigtts: '\u60ac\u7591\u89e3\u8bf4 2.0',
  zh_female_mengyatou_uranus_bigtts: '\u840c\u4e2b\u5934 Cutey 2.0',
  zh_female_tiexinnvsheng_uranus_bigtts: '\u8d34\u5fc3\u5973\u58f0 Candy 2.0',
  zh_female_jitangmei_uranus_bigtts: '\u9e21\u6c64\u59b9\u59b9 Hope 2.0',
  zh_male_cixingjieshuonan_uranus_bigtts: '\u78c1\u6027\u89e3\u8bf4\u7537\u58f0 Morgan 2.0',
  zh_male_liangsangmengzai_uranus_bigtts: '\u4eae\u55d3\u840c\u4ed4 2.0',
  zh_female_kailangjiejie_uranus_bigtts: '\u5f00\u6717\u59d0\u59d0 2.0',
  zh_male_gaolengchenwen_uranus_bigtts: '\u9ad8\u51b7\u6c89\u7a33 2.0',
  zh_male_shenyeboke_uranus_bigtts: '\u6df1\u591c\u64ad\u5ba2 2.0',
  zh_male_lubanqihao_uranus_bigtts: '\u9c81\u73ed\u4e03\u53f7 2.0',
  zh_female_jiaochuannv_uranus_bigtts: '\u5a07\u5598\u5973\u58f0 2.0',
  zh_female_linxiao_uranus_bigtts: '\u6797\u6f47 2.0',
  zh_female_lingling_uranus_bigtts: '\u73b2\u73b2\u59d0\u59d0 2.0',
  zh_female_chunribu_uranus_bigtts: '\u6625\u65e5\u90e8\u59d0\u59d0 2.0',
  zh_male_tangseng_uranus_bigtts: '\u5510\u50e7 2.0',
  zh_male_zhuangzhou_uranus_bigtts: '\u5e84\u5468 2.0',
  zh_male_kailangdidi_uranus_bigtts: '\u5f00\u6717\u5f1f\u5f1f 2.0',
  zh_male_zhubajie_uranus_bigtts: '\u732a\u516b\u6212 2.0',
  zh_female_ganmaodianyin_uranus_bigtts: '\u611f\u5192\u7535\u97f3\u59d0\u59d0 2.0',
  zh_female_chanmeinv_uranus_bigtts: '\u8c04\u5a9a\u5973\u58f0 2.0',
  zh_female_nvleishen_uranus_bigtts: '\u5973\u96f7\u795e 2.0',
  zh_female_qinqienv_uranus_bigtts: '\u4eb2\u5207\u5973\u58f0 2.0',
  zh_male_kuailexiaodong_uranus_bigtts: '\u5feb\u4e50\u5c0f\u4e1c 2.0',
  zh_male_kailangxuezhang_uranus_bigtts: '\u5f00\u6717\u5b66\u957f 2.0',
  zh_male_youyoujunzi_uranus_bigtts: '\u60a0\u60a0\u541b\u5b50 2.0',
  zh_female_wenjingmaomao_uranus_bigtts: '\u6587\u9759\u6bdb\u6bdb 2.0',
  zh_female_zhixingnv_uranus_bigtts: '\u77e5\u6027\u5973\u58f0 2.0',
  zh_male_qingshuangnanda_uranus_bigtts: '\u6e05\u723d\u7537\u5927 2.0',
  zh_male_yuanboxiaoshu_uranus_bigtts: '\u6e0a\u535a\u5c0f\u53d4 2.0',
  zh_male_yangguangqingnian_uranus_bigtts: '\u9633\u5149\u9752\u5e74 2.0',
  zh_female_qingchezizi_uranus_bigtts: '\u6e05\u6f88\u6893\u6893 2.0',
  zh_female_tianmeiyueyue_uranus_bigtts: '\u751c\u7f8e\u60a6\u60a6 2.0',
  zh_female_xinlingjitang_uranus_bigtts: '\u5fc3\u7075\u9e21\u6c64 2.0',
  zh_male_wenrouxiaoge_uranus_bigtts: '\u6e29\u67d4\u5c0f\u54e5 2.0',
  zh_female_roumeinvyou_uranus_bigtts: '\u67d4\u7f8e\u5973\u53cb 2.0',
  zh_male_dongfanghaoran_uranus_bigtts: '\u4e1c\u65b9\u6d69\u7136 2.0',
  zh_female_wenrouxiaoya_uranus_bigtts: '\u6e29\u67d4\u5c0f\u96c5 2.0',
  zh_male_tiancaitongsheng_uranus_bigtts: '\u5929\u624d\u7ae5\u58f0 2.0',
  zh_female_wuzetian_uranus_bigtts: '\u6b66\u5219\u5929 2.0',
  zh_female_gujie_uranus_bigtts: '\u987e\u59d0 2.0',
  zh_male_guanggaojieshuo_uranus_bigtts: '\u5e7f\u544a\u89e3\u8bf4 2.0',
  zh_female_shaoergushi_uranus_bigtts: '\u5c11\u513f\u6545\u4e8b 2.0',
  saturn_zh_female_tiaopigongzhu_tob: '\u8c03\u76ae\u516c\u4e3b',
  saturn_zh_female_keainvsheng_tob: '\u53ef\u7231\u5973\u751f',
  saturn_zh_male_shuanglangshaonian_tob: '\u723d\u6717\u5c11\u5e74',
  saturn_zh_male_tiancaitongzhuo_tob: '\u5929\u624d\u540c\u684c',
  saturn_zh_female_cancan_tob: '\u77e5\u6027\u707f\u707f',
  saturn_zh_female_qingyingduoduo_cs_tob: '\u8f7b\u76c8\u6735\u6735 2.0',
  saturn_zh_female_wenwanshanshan_cs_tob: '\u6e29\u5a49\u73ca\u73ca 2.0',
  saturn_zh_female_reqingaina_cs_tob: '\u70ed\u60c5\u827e\u5a1c 2.0',
  saturn_zh_male_qingxinmumu_cs_tob: '\u6e05\u65b0\u6c90\u6c90 2.0',
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    apiKey: process.env.VOLCENGINE_API_KEY,
    resourceId: DEFAULT_RESOURCE_ID,
    text: DEFAULT_TEXT,
    outDir: 'assets/voice-samples',
    voicesFile: '',
    overwrite: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = () => args[++i];

    if (arg === '--api-key') {
      options.apiKey = next();
    } else if (arg.startsWith('--api-key=')) {
      options.apiKey = arg.slice('--api-key='.length);
    } else if (arg === '--resource-id') {
      options.resourceId = next();
    } else if (arg.startsWith('--resource-id=')) {
      options.resourceId = arg.slice('--resource-id='.length);
    } else if (arg === '--text') {
      options.text = next();
    } else if (arg.startsWith('--text=')) {
      options.text = arg.slice('--text='.length);
    } else if (arg === '--out-dir') {
      options.outDir = next();
    } else if (arg.startsWith('--out-dir=')) {
      options.outDir = arg.slice('--out-dir='.length);
    } else if (arg === '--voices-file') {
      options.voicesFile = next();
    } else if (arg.startsWith('--voices-file=')) {
      options.voicesFile = arg.slice('--voices-file='.length);
    } else if (arg === '--overwrite') {
      options.overwrite = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
};

const printHelp = () => {
  console.log(`Generate Volcengine TTS voice samples.

Usage:
  node scripts/generate-voice-samples.mjs [options]

Options:
  --api-key <key>          Volcengine API Key. Defaults to VOLCENGINE_API_KEY or inputs/example.json.
  --resource-id <id>       Resource ID. Default: ${DEFAULT_RESOURCE_ID}
  --text <text>            Text to synthesize. Default: ${DEFAULT_TEXT}
  --out-dir <dir>          Output directory. Default: assets/voice-samples
  --voices-file <file>     Optional newline/JSON voice type list.
  --overwrite              Regenerate existing mp3 files.
`);
};

const loadApiKeyFromInputs = () => {
  for (const rel of [
    'inputs/blue-book-record-player.example.json',
    'inputs/example.json',
  ]) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) {
      continue;
    }

    const config = JSON.parse(fs.readFileSync(full, 'utf8'));
    const apiKey = config.tts?.apiKey;
    if (typeof apiKey === 'string' && apiKey.trim()) {
      return apiKey.trim();
    }
  }

  return '';
};

const loadVoiceTypes = (voicesFile) => {
  if (!voicesFile) {
    return VOICE_TYPES;
  }

  const full = path.isAbsolute(voicesFile)
    ? voicesFile
    : path.join(root, voicesFile);
  const raw = fs.readFileSync(full, 'utf8').trim();
  if (!raw) {
    return [];
  }

  if (raw.startsWith('[')) {
    return JSON.parse(raw);
  }

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const voiceName = (voiceType) => VOICE_NAMES[voiceType] || voiceType;

const safeFileName = (name) =>
  name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '');

const sampleFileName = (voiceType) =>
  `${safeFileName(`${voiceName(voiceType)}_${voiceType}`)}.mp3`;

const parseJsonLines = (text) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));

const synthesize = async ({apiKey, resourceId, voiceType, text}) => {
  const requestId = crypto.randomUUID();
  const response = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Api-Resource-Id': resourceId,
      'X-Api-Request-Id': requestId,
    },
    body: JSON.stringify({
      user: {uid: 'podcastx-voice-samples'},
      namespace: 'BidirectionalTTS',
      req_params: {
        text,
        speaker: voiceType,
        audio_params: {
          format: 'mp3',
          sample_rate: 24000,
        },
      },
    }),
  });

  const logId = response.headers.get('X-Tt-Logid');
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}${logId ? ` logid=${logId}` : ''}: ${body}`);
  }

  const audioParts = [];
  for (const chunk of parseJsonLines(body)) {
    if (chunk.code === CODE_AUDIO_CHUNK && chunk.data) {
      audioParts.push(Buffer.from(chunk.data, 'base64'));
      continue;
    }

    if (chunk.code === CODE_SUCCESS || chunk.sentence) {
      continue;
    }

    throw new Error(
      `TTS failed${logId ? ` logid=${logId}` : ''}: ${JSON.stringify(chunk)}`,
    );
  }

  const audio = Buffer.concat(audioParts);
  if (audio.length === 0) {
    throw new Error(`No audio returned${logId ? ` logid=${logId}` : ''}`);
  }

  return audio;
};

const main = async () => {
  const options = parseArgs();
  const apiKey = options.apiKey?.trim() || loadApiKeyFromInputs();
  if (!apiKey) {
    throw new Error('Missing API key. Pass --api-key or set VOLCENGINE_API_KEY.');
  }

  const voices = [...new Set(loadVoiceTypes(options.voicesFile))];
  const outDir = path.isAbsolute(options.outDir)
    ? options.outDir
    : path.join(root, options.outDir);
  fs.mkdirSync(outDir, {recursive: true});

  const summary = [];
  console.log(`Generating ${voices.length} samples into ${outDir}`);

  for (const [index, voiceType] of voices.entries()) {
    const name = voiceName(voiceType);
    const output = path.join(outDir, sampleFileName(voiceType));
    if (!options.overwrite && fs.existsSync(output) && fs.statSync(output).size > 0) {
      console.log(`[${index + 1}/${voices.length}] skip ${name} ${voiceType}`);
      summary.push({name, voiceType, status: 'skipped', output});
      continue;
    }

    try {
      console.log(`[${index + 1}/${voices.length}] synth ${name} ${voiceType}`);
      const audio = await synthesize({
        apiKey,
        resourceId: options.resourceId,
        voiceType,
        text: options.text,
      });
      fs.writeFileSync(output, audio);
      summary.push({name, voiceType, status: 'ok', output, bytes: audio.length});
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[${index + 1}/${voices.length}] fail ${name} ${voiceType}: ${message}`,
      );
      summary.push({name, voiceType, status: 'failed', error: message});
    }
  }

  const summaryPath = path.join(outDir, 'summary.json');
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  const okCount = summary.filter((item) => item.status === 'ok').length;
  const failedCount = summary.filter((item) => item.status === 'failed').length;
  const skippedCount = summary.filter((item) => item.status === 'skipped').length;
  console.log(
    `Done. ok=${okCount} skipped=${skippedCount} failed=${failedCount} summary=${summaryPath}`,
  );

  if (failedCount > 0) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
