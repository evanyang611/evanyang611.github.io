## 引入

這份分享是 2023 年 6 月做的。彼時"AI 孫燕姿"正在全網刷屏——用孫燕姿的音色去翻唱 Vitas 的《Opera 2》、周杰倫的《發如雪》、林俊傑的《一路向北》——聽感幾可亂真。

![AI 孫燕姿 相關翻唱作品](/blogs/ai-tts/s3-arknights.png?w=680)

孫燕姿本人後來在個人博客發了一篇聲明《我的 AI》回應，說這波"AI 翻唱"是自己也沒料到的事——態度裡帶著一絲哭笑不得的坦然。

![孫燕姿聲明《我的 AI》](/blogs/ai-tts/s3-sunyanzi.jpeg?w=320)

熱度背後的技術底座，是一個叫 **So-VITS-SVC** 的開源項目（SoftVC + VITS Singing Voice Conversion）。而 VITS 本身，是 2021 年 ICML 上的一篇端到端語音合成論文（Kim, J., Kong, J., Son, J., 2021. Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech）。想搞清楚"AI 孫燕姿"為什麼突然可行，需要把語音合成這條技術線從頭到尾梳理一遍。

### 時代背景

同時代的背景是 ChatGPT 已經引爆全球。B 站的 AI 相關視頻發佈量在 2023 年初出現指數級增長——

![B 站 AI 視頻發佈量（AI 語音 / AI 作畫 / AI 對話）](/blogs/ai-tts/s4-bilibili-all.png?w=720)

上圖能清楚看到三條時間線上的引爆點：

- **NovelAI**（2022-10 前後）→ AI 作畫（橙色）率先起量
- **ChatGPT 發佈**（2022-11-30）→ AI 對話（綠色）飆升
- **ChatGPT 引國內主流媒體熱議**（2023-02）→ 綠色柱達到峰值
- **GPT-4 發佈 + LoRA 訓練教程流行**（2023-03 起）→ 三條線全面爆發

單看**AI 語音**這條線：

![B 站 AI 語音視頻發佈量](/blogs/ai-tts/s4-bilibili-voice.png?w=720)

從 2022 年 5 月的接近 0，到 2023 年 4 月的每週 400+ 條——剛好是這次分享的前夜。


## 智能語音的三個方向

先把"智能語音"這個大領域切開看：

![ASR / TTS / VC 三個方向](/blogs/ai-tts/s5-asr-tts-vc.png?w=520)

- **語音 → 文字**：Automatic Speech Recognition (ASR)，即語音識別
- **文字 → 語音**：Text-to-Speech Synthesis (TTS)，即語音合成
- **語音 → 語音**：Speech Separation & Voice Conversion (VC)，即語音分離與音色轉換

"AI 孫燕姿"屬於第三類——把一段人聲的音色換成另一個人的，不改內容也不改旋律。但要理解 VC，得先理解 TTS，因為 VC 是從 TTS 的架構里長出來的。


## 語音信號基礎知識

### 什麼是聲音

要做語音合成，先要理解語音這個信號本身是什麼。

![聲音三要素：響度、音調、音色](/blogs/ai-tts/s6-three-props.png?w=420)

聲波通過空氣傳播，被麥克風接收，通過**模數轉換器（ADC）**採樣、量化轉換為離散的數字信號——就是我們平時說的**波形文件**。

![聲波與 ADC](/blogs/ai-tts/s6-adc.jpeg?w=180)

聲音有三個基本屬性：**響度（音量）、音調、音色**。

| 名詞 | 含義 |
| --- | --- |
| 聲波 | 通過空氣傳播，被麥克風接收，採樣、量化後轉為離散數字信號 |
| 能量 | 時域上每幀的能量，幅度的平方 |
| 短時能量 | 信號在不同時刻的強弱程度 |
| 聲強 | 單位時間內通過垂直於聲波傳播方向的單位面積的平均聲能，單位分貝（dB） |
| 響度（音量） | 主觀心理量，人類感覺到的聲音強弱，與聲強和頻率有關，單位方（phon） |
| 基頻 | 基音週期的倒數，對應聲帶振動頻率，代表音高。成年男性 100–250Hz，女性 150–350Hz |
| 諧波 | 基頻對應的整數次頻率成分，由聲帶發聲帶動空氣共振形成，對應音色 |

有幾個非直覺的點值得強調：

**人類可感知聲音的頻率大致在 20–20000Hz 之間**，但人類對基頻的感知遵循**對數律**——也就是說，人們會感覺 100Hz 到 200Hz 的差距，和 200Hz 到 400Hz 的差距是相同的。這對後面要講的**梅爾頻譜**很關鍵。

**音色由什麼決定？** 是諧波。基頻決定音調，但決定"這是誰的聲音"的，是基頻之上那些整數倍的諧波成分的位置和相鄰距離。So-VITS-SVC 換音色，本質上就是在換這些諧波結構。

### 音頻數字信號的構成

三個關鍵參數：**採樣位深、採樣率、通道數**。

![CD / MP3 / DVD 等常見音頻格式](/blogs/ai-tts/s7-cd-formats.png?w=680)

**採樣位深**——每個樣本所佔比特數
- 16Bit：動態範圍約 96dB，適用於普通流行歌曲
- 24Bit：動態範圍約 144dB，用於電影配樂、交響樂團等大動態音頻

**採樣率**——每秒鐘採樣樣本的總數
- 8KHz：電話
- 22.050KHz：無線電廣播
- 44.1KHz：音頻 CD、MP3
- 48KHz：miniDV、數字電視、DVD、電影和專業音頻
- 96KHz / 192KHz：DVD-Audio、藍光音軌

**通道數**——採集信號的條數：單聲道、雙聲道（立體聲）、2.1、5.1、7.1 聲道等。

舉個具體例子——用 librosa 讀一個音頻文件：

![librosa 讀音頻 - 波形](/blogs/ai-tts/s8-waveform.png?w=560)

- **採樣位深 16bit**：`2^15 = 32768`，每個點的值在 `[-32768, 32767]`，librosa 會做歸一化處理
- **採樣率 48000Hz**：每秒 48000 個點
- **通道數 1**：1 條序列

**存儲空間 = 採樣位深 × 採樣率 × 通道數 × 時長**

一個 5 秒的 48kHz 單聲道音頻，讀出來是一個形狀為 `(239104,)` 的數組。


## 語音特徵提取

原始波形直接餵給神經網絡，效果並不好——因為波形本身的信息密度很低，而且是**非平穩信號**。所以工業上普遍先做特徵提取，把波形轉成頻域上更結構化的表示。

### 短時平穩特性

語音信號整體是非平穩的，但由於發濁音時聲帶**有規律**地振動，基音頻率在**短時範圍內**是相對固定的。因此可以認為語音信號具有**短時平穩特性**——一般認為 10ms 到 50ms 的語音信號片段是一個準穩態過程。

這個假設是所有後續處理的基石。

![音素、字素、發音、音節](/blogs/ai-tts/s9-phoneme.png?w=560)

順便對齊幾個術語：

| 名詞 | 含義 |
| --- | --- |
| 音素（phoneme） | 也稱音位，能夠區別意義的最小語音單位。同一音素由不同人/環境讀出，可以形成不同發音 |
| 字素（grapheme） | 音素對應的文本 |
| 發音（phone） | 某個音素的具體發音 |
| 音節（syllable） | 由音素組成，一個漢字就是一個音節 |

音位並不是一個實際的語音——它是心理上的等價類。一個音位可以有數種不同發音，語言使用者心理上認定它們等同，甚至察覺不到語音上的區別。這種音位內的不同發音叫做**同位異音**或**音位變體**。

**IPA（International Phonetic Alphabet，國際音標）** 是跨語言的音位標註體系：

![國際音標 IPA 表](/blogs/ai-tts/s10-ipa-chart.jpeg?w=320)

TTS 系統通常先把文本轉成音位標註（拼音、注音、IPA），再從音位出發去合成聲學信號。

### 預加重、分幀、加窗

從波形到頻譜，中間要過三步預處理：

**預加重**：語音經過說話人的口唇輻射發出，受到唇端輻射抑制，高頻能量明顯降低。用一個一階差分來補償：

$$x'[n] = x[n] - a \times x[n-1]$$

![預加重效果對比](/blogs/ai-tts/s11-preemphasis.png?w=280)

**分幀**：一般每幀幀長 20ms 或 50ms。相鄰兩幀之間的基音可能發生變化（如兩個音節之間、聲母向韻母過渡）。為確保聲學特徵的平滑性，採用**重疊取幀**——幀長和幀移的比例一般為 1:4 或 1:5。

![分幀示意](/blogs/ai-tts/s11-framing.png?w=280)

以 50ms 為幀長、1:4 的比例、48000Hz 採樣率為例——一幀有 2400 個點，1 秒鐘有 81 幀。

**加窗**：分幀本身相當於對語音信號加了矩形窗，矩形窗會在時域邊界處產生多個旁瓣，引起**頻譜洩露**。為了減少洩露，通常在分幀後加平滑窗——漢明（Hamming）窗、漢寧（Hanning）窗、布萊克曼（Blackman）窗都是常用選擇。

![常用窗函數](/blogs/ai-tts/s11-window.png?w=520)

### 傅里葉變換與短時傅里葉變換

**傅里葉變換（FT）**：任何連續週期函數可以表示為一系列正弦和餘弦函數的線性組合。藉助歐拉公式，可以進一步把它寫成復指數函數的積分——從實數域映射到複數域。

**短時傅里葉變換（STFT）**：把資料切割成大量互相重疊的幀，每組幀分別做傅里葉變換，得到每個時間點上的頻率大小與相位信息。

![STFT 示意](/blogs/ai-tts/s12-stft.png?w=440)

![STFT 數學表達](/blogs/ai-tts/s12-formula.png?w=280)

用剛才的 239104 點音頻做例子——幀長 2048、幀移 1/4，一共 `239104/(2048/4)+1 = 468` 幀。

![STFT 結果矩陣](/blogs/ai-tts/s13-stft-result.png?w=340)

STFT 結果形狀是 `(1025, 468)`——每個元素是一個複數，表示 `[振幅, 相位]`。為什麼頻率維度是 1025？因為**奈奎斯特採樣定理**：要從抽樣信號中無失真地恢復原信號，抽樣頻率應大於 2 倍信號最高頻率。所以最高頻率對應的 bin 數是 `2048/2+1 = 1025`。

### 頻譜與梅爾頻譜

**頻譜圖（Spectrogram）**，又叫語譜圖，是一種把音頻信號在時間和頻率上進行可視化的圖形——橫軸時間、縱軸頻率、顏色深淺表示能量大小。這就是我們平時看到的"聲音的樣子"。

![語譜圖示例](/blogs/ai-tts/s14-spectrogram.png?w=600)

![語譜圖數據](/blogs/ai-tts/s14-spec-vis.png?w=400)

**梅爾頻譜（Mel-Spectrogram）**：前面提過，人類對不同頻率的語音有不同感知能力：

1. 1kHz 以下，人耳感知與頻率成**線性**關係
2. 1kHz 以上，人耳感知與頻率成**對數**關係

![Mel 刻度曲線](/blogs/ai-tts/s15-mel-curve.png?w=300)

也就是說，人耳對低頻信號比高頻信號更敏感。既然人耳如此，直接用線性頻譜訓練模型就是浪費——很多高頻段的差異人根本聽不出來。

![Mel scale 轉換](/blogs/ai-tts/s15-mel-scale.png?w=200)

於是引入 **mel 刻度**：1 個 mel 刻度相當於人對 1kHz 音頻感知程度的千分之一。mel 刻度表達的是從**線性頻率**到**"感知頻率"**的轉換關係。梅爾頻譜在低頻段密、高頻段稀，更貼合人耳的實際分辨力。

![梅爾頻譜示例](/blogs/ai-tts/s15-mel-spec.png?w=420)

後面所有 TTS 模型輸出的都是**梅爾頻譜**，而不是原始波形——因為梅爾頻譜是一個信息密度高、維度低、貼合聽感的中間表示。


## TTS 模型總覽

現代工業級神經網絡語音合成系統，主要包括三個部分：

![TTS 三段式：文本前端 + 聲學模型 + 聲碼器](/blogs/ai-tts/s16-tts-pipeline.png?w=720)

1. **文本前端**：文本輸入進來，轉換為音素、韻律邊界等文本特徵
2. **聲學模型**：文本特徵轉換為對應的聲學特徵（通常是梅爾頻譜）
3. **聲碼器（Vocoder）**：聲學特徵重建為原始波形

![TTS 各模塊細節](/blogs/ai-tts/s16-tts-detail.png?w=720)

綜述論文 *A Survey on Neural Speech Synthesis*（Tan et al., 2021）把這個領域按聲學模型、聲碼器、端到端三大方向做了完整梳理：

![Neural TTS 綜述 - 譜系圖 1](/blogs/ai-tts/s17-tts-family1.png?w=600)

![Neural TTS 綜述 - 譜系圖 2](/blogs/ai-tts/s17-tts-family2.png?w=400)

後面按時間順序過一遍這條線上的關鍵模型——從 2017 年的 Tacotron 到 2023 年的 VALL-E。

### 評估指標

在講模型前，先說怎麼評估合成語音的好壞。

**主觀評價**：人類對語音打分，代表性指標：
- **MOS**（Mean Opinion Score，平均意見得分）
- **CMOS**（CrowdMOS，眾包平均意見得分）
- **ABX 測試**

**客觀評價**：通過計算機自動給出評估，比如**MCD**（Mel Cepstral Distortion，梅爾倒譜失真）。但客觀評價在語音合成領域研究得比較少——原因很直接：**這個領域最終判官是人耳**。

國際電信聯盟（ITU）把 MOS 評測規範化為 ITU-T P.800，其中**絕對等級評分（ACR）** 應用最廣：

![ACR 評分標準（ITU-T P.800）](/blogs/ai-tts/s18-mos-table.png?w=680)


## Vocoder（聲碼器）

從梅爾頻譜回到波形，有幾種主流做法。

### Griffin-Lim 算法

**不需要訓練**——通過幀與幀之間的關係估計相位信息，使用逆短時傅里葉變換迭代生成，重建語音波形。原理簡單、速度快，但音質有限。Tacotron 1 用的就是它。

### WaveNet

Google 在 2016 年提出的深度神經網絡聲碼器。可以使用模型生成的梅爾頻譜來訓練。

![WaveNet 膨脹因果卷積](/blogs/ai-tts/s19-wavenet.png?w=520)

WaveNet 最大的成功之處是使用 **dilated causal convolution（膨脹因果卷積）** 技術來增加 CNN 的感受野（receptive field），從而提升了模型建模 long dependency 的能力——語音波形的相關性可以跨越幾千個採樣點，普通 CNN 感受野不夠，膨脹卷積用指數級擴張的孔洞覆蓋長距離依賴，同時又保持了參數量可控。

WaveNet 是很多後續 TTS 系統的默認聲碼器，Tacotron 2 就是配 WaveNet 用的。


## Tacotron 系列

### Tacotron（Google 2017.03）

第一個真正意義上的端到端神經網絡 TTS——Encoder + Decoder 結構。

![Tacotron 架構圖](/blogs/ai-tts/s20-tacotron.png?w=680)

**核心組件 CBHG**——1-D convolution bank + highway network + bidirectional GRU。這個組件是 Tacotron 裡最特色的部分。

![CBHG 模塊](/blogs/ai-tts/s20-cbhg.png?w=260)

**流程**：
- 文本 → Encoder → hidden representation
- Hidden representation → Decoder → mel 頻譜
- mel 頻譜 → Griffin-Lim → 波形

**Encoder**：Pre-net + CBHG
- Pre-net：全連接層 + dropout
- CBHG：卷積 + 池化 + 殘差鏈接 + 雙向 GRU，輸入序列、輸出序列

**Decoder**：雙層 GRU，分為 attention decoder 和 output decoder
- Attention decoder 生成 query vector 作為 attention 輸入
- Output decoder 把 query vector 和 context vector 一起輸入
- 每一步預測多個 frame（加速收斂）
- 最後把 mel 頻譜轉為線性頻譜，用 Griffin-Lim 生成最終波形

### Tacotron 2（Google 2017.12）

![Tacotron 2 架構圖](/blogs/ai-tts/s21-tacotron2.png?w=420)

在 Tacotron 基礎上做了幾處關鍵改動：

- 拋棄 CBHG，改用普通的 **LSTM + 卷積**
- Decoder 每一步只預測一個 frame
- 增加 **Post-net** 精調 mel 譜
- 換用更強的 Vocoder（**WaveNet**）

![Tacotron 2 細節](/blogs/ai-tts/s21-tacotron2-arch.png?w=560)

**Encoder**：字符/音素編碼 → 三層卷積 → 雙向 LSTM → 保持維度不變

**Decoder**：mel 譜 → Pre-net → LSTM
- 一條路和文本輸出做 attention，找對應關係
- 一條路和自己做卷積，提取 mel 譜自身的特徵
- 兩條路合併
- 一條路判斷是否要 stop
- 一條路走 5 層 Post-net 卷積，得到最終 mel 譜

Tacotron 2 是 2017 年到 2019 年之間事實上的 TTS 標杆。


## FastSpeech 系列

### FastSpeech（Microsoft 2019）

Tacotron 2 有幾個明顯問題：

- **合成速度慢**——自迴歸模型必須一幀一幀生成
- **不夠穩健**（robust）——序列模型的錯誤傳播
- **缺乏控制手段**——無法控制語速或韻律

![FastSpeech 架構](/blogs/ai-tts/s22-fastspeech.png?w=600)

FastSpeech 的核心思路是**非自迴歸**——一次性並行輸出整段 mel 譜。為此需要提前知道每個音素對應幾個 frame，於是引入兩個關鍵模塊：

![FastSpeech Duration Predictor / Length Regulator](/blogs/ai-tts/s22-fastspeech-detail.png?w=380)

**Duration Predictor**：訓練時用一個自迴歸模型生成 mel 譜，與真實 mel 譜順序對應，根據差距訓練每個音素的 duration。Inference 時**不用自迴歸**，直接預測——加快速度。

**Length Regulator**：預測一個音素對應幾個 frame，生成時把對應的 mel 譜重複多次。有超參數可以調節——**這就帶來了控制語速的能力**。

### FastSpeech 2（Microsoft 2020）

![FastSpeech 2 架構](/blogs/ai-tts/s23-fastspeech2.png?w=520)

FastSpeech 2 除了 Duration Predictor，又增加了 **Energy Predictor**、**Pitch Predictor** 等多個模塊——每一個模塊都是一維的可控信號，直接注入到中間表示裡。這讓韻律、能量、音高都變得可控。

![FastSpeech 2s：直出波形](/blogs/ai-tts/s23-fastspeech2s.png?w=300)

**FastSpeech 2s** 版本更激進——輸出結果從 mel 譜改為**波形譜**，聲學模型和聲碼器合二為一。


## VITS：端到端的勝利

### VITS（KAIST & Kakao 2021）

**Variational Inference with adversarial learning for end-to-end Text-to-Speech**

這是這場分享的核心模型。VITS 把三個強大的生成模型思想縫在了一起：**VAE + Flow + GAN**。

![VITS 訓練 / 推理架構](/blogs/ai-tts/s24-vits-arch.png?w=720)

三條設計原則：

1. VITS 框架包含兩個子系統——基於 **VAE** 的變聲系統 + 基於 **Flow** 的語音合成系統。VAE 擅長捕捉句子**整體**的韻律特徵，Flow 擅長重建音頻的**細節**特徵。兩者整合，多任務訓練，參數與優勢共享。

2. VITS 的語音合成系統**直接合成音頻**而不是 MEL 譜——實現真正的端到端合成，而非"聲學模型 + 聲碼器"的兩段式。這樣消除了兩個模型之間的 gap（分段訓練常見的失配問題）。

3. 傳統 TTS 中，GAN 訓練只應用於聲碼器；而 VITS 裡 GAN 訓練是**全局**的、對每個模塊都有效——判別器對生成波形整體打分。

### Generative Model 快速回顧

在展開 VITS 結構前，先對齊幾個基礎生成模型：

![GAN / VAE / Flow / Diffusion / AR 概覽](/blogs/ai-tts/s25-gen-models.png?w=580)

- **GAN**：訓練生成器（Generator）的同時訓練判別器（Discriminator），兩者極小極大博弈，相互變強
- **VAE**：無監督訓練一個神經網絡，Encoder 把原始輸入壓縮成中間表示，Decoder 從編碼中重建
- **FLOW**：假設原始數據分佈可以通過一系列**可逆**轉化函數從已知分佈獲得。通過雅可比行列式和變量變化規則，可以直接估計真實數據的概率密度
- **Diffusion Models**：定義正向和逆向兩個過程。正向從真實分佈採樣，逐步加高斯噪聲；逆向從噪聲開始學一個模型估計條件概率，把噪聲一步步還原

### 變分自編碼器 VAE

VAE 是 VITS 中最核心的組件，值得單獨講一下。

![標準自編碼器](/blogs/ai-tts/s26-ae.png?w=420)

**標準自編碼器**：把 X 編碼成低維的 Z，再解碼成 X'。目標是讓 X' 儘量接近 X。

![變分自編碼器 VAE](/blogs/ai-tts/s26-vae.png?w=420)

**VAE 的關鍵區別**：Z 不是一個固定值，而是一個**分佈**（通常參數化為高斯的 μ 和 σ）。通過對 Z 採樣，可以生成**原來數據集裡不存在**的 X'——這就有了生成能力。

![VAE 數學推導](/blogs/ai-tts/s26-vae-math.png?w=500)

VAE 用神經網絡來模仿真實的 `p(Z|X)`。經過數學推導，損失函數可以拆成兩項：

- **重建誤差**：Decoder 生成的 X 與原來 X 儘可能接近
- **KL 散度**：Encoder 學習的 Z 分佈與真實 Z 的先驗分佈儘可能相似（真實 Z 的先驗定義為**標準正態**）

這兩項一個約束"能不能還原"，一個約束"Z 空間是不是良態"。

### VITS 的結構

VITS 的完整數據流：

**先驗編碼器**：文本 → transformer → 帶 μ, σ 的分佈 → 通過對齊矩陣 A → 隱變量 Z

**後驗編碼器**：線性譜 → Encoder → 通過 Flow 的變化函數 → 隱變量 Z

**訓練目標**：讓這兩個隱變量儘可能接近（KL 散度）

**隨機時長預測器**：單獨一個模塊，學習對齊矩陣 A

**解碼器**：從隱變量 Z 生成波形

**判別器**：單獨一個模塊，判別波形真偽

**Inference 時**：文本 → 編碼器 → Z 的分佈 → 隨機時長預測器 → Flow 的逆變換 → Z → 解碼器 → 波形

### VITS 的效果

![VITS vs Tacotron 2 / Glow-TTS MOS 對比](/blogs/ai-tts/s28-vits-mos.png?w=480)

VITS 的 MOS 達到 **4.43**（Ground Truth 是 4.46），已經非常逼近真人配音的聽感極限。

各 loss 項：

- `L_recon`：生成內容的梅爾譜與真實梅爾譜的 L1 loss（重構 loss）
- `L_kl`：從線性譜得到的隱變量 z 與從文本+對齊矩陣得到的隱變量 z 的 KL 散度
- `L_dur`：隨機時長預測器的模型 loss
- `L_adv(G)`：判別器將生成內容判別為真的 loss
- `L_fm(G)`：判別器的中間輸出——讓生成內容和真實內容在判別器內部的中間層特徵也接近

多個 loss 聯合訓練，讓每個子模塊都被推向正確方向。


## So-VITS-SVC：AI 孫燕姿的技術底座

**SoftVC + VITS**——SoVITS 的名字就是拼出來的。

![SoftVC 內容編碼器（discrete vs soft）](/blogs/ai-tts/s29-sovits-arch.png?w=720)

原始 GitHub 倉庫是 `github.com/innnky/so-vits-svc`（後來作者刪庫了），社區接手的版本在 `github.com/svc-develop-team/so-vits-svc`。

**核心思路**：在文本 Encoder 里加一層 ASR（**HuBERT**：基於 BERT 的自監督語音表示學習），只傳遞**文本信息**（內容），**不傳遞音色信息**——然後用目標歌手的音色去解碼。

這樣做的效果是——輸入一段任意人的幹聲（比如某個 UP 主翻唱周杰倫），HuBERT 抽出內容信息，VITS 的解碼器用孫燕姿的聲學模型重建波形——就得到了"孫燕姿唱的這首歌"。

### 示例

自己訓了一個模型作為演示。數據規模：

- **600+ 條，1–10 秒的語音**——素材來自米哈遊遊戲《原神》裡的角色**神里綾華**
- **訓練硬件**：RTX A5000 (24GB) × 1
- **訓練時長**：約 48 小時

![神里綾華 立繪](/blogs/ai-tts/ayaka.jpeg?w=360)

角色設定簡介——稻妻國（原型為幕府時期日本）神里家的大小姐，負責神社、慶典及文化事務的管理。

下面是**文本原聲（真人配音演員錄製）**與 **VITS 生成**的對照。同一段文本餵給兩邊，直接用耳朵比對：

<div class="ab-list">

<div class="ab-item">
<p class="ab-text">晚上好。夜風舒暢，會是一個良宵呢。</p>
<div class="ab-row"><span class="ab-label">原聲</span><audio controls preload="none" src="/blogs/ai-tts/orig-1.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-1.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">不不……你過獎了，我只是完成應盡之事。</p>
<div class="ab-row"><span class="ab-label">原聲</span><audio controls preload="none" src="/blogs/ai-tts/orig-2.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-2.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">「雪霽銀妝素，桔高映瓊枝。」嗯……美景當前，只差一壺茶與之相襯呢。</p>
<div class="ab-row"><span class="ab-label">原聲</span><audio controls preload="none" src="/blogs/ai-tts/orig-3.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-3.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">啊、啊……等一下！請先……先別走……</p>
<div class="ab-row"><span class="ab-label">原聲</span><audio controls preload="none" src="/blogs/ai-tts/orig-4.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-4.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">若知是夢何須醒，不比真如一相會。</p>
<div class="ab-row"><span class="ab-label">原聲</span><audio controls preload="none" src="/blogs/ai-tts/orig-5.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-5.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">作為神里家的家主，兄長平日需要出面諸多場合。我雖盡力分擔兄長肩上所負擔的責任，卻也無法緩和他常年積壓在身的疲倦。</p>
<div class="ab-row"><span class="ab-label">原聲</span><audio controls preload="none" src="/blogs/ai-tts/orig-6.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-6.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">「坦率」，真的是一件很難的事情。我必須不斷告誡自己是神里家的大小姐，在無數雙眼睛，無數人的期盼之下襬出完美無缺的姿態。</p>
<div class="ab-row"><span class="ab-label">原聲</span><audio controls preload="none" src="/blogs/ai-tts/orig-7.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-7.wav"></audio></div>
</div>

</div>

聽感上音色的相似度相當高——起伏、氣息、斷句都擬得住。600 條數據 + 單張 A5000 訓 48 小時，2023 年 6 月的開源棧已經能做到這個水平。


## VALL-E 與 AudioLM：語言模型範式

進入 2022–2023 年，語音合成開始被 NLP 的範式重構——**把音頻當作 token 序列，用 GPT 那一套預測下一個 token**。這個方向上兩個代表工作。

### VALL-E（Microsoft 2023）

![VALL-E 總覽](/blogs/ai-tts/s31-valle.jpeg?w=560)

- 訓練集：**60K 小時**英文語音，**7000** 個聲源
- Zero-shot：**只需 3 秒**的樣本即可複製目標音色
- 架構範式轉變：以往是**音素 → mel 譜 → 波形**；VALL-E 是**音素 → 離散編碼 → 波形**

**核心是 EnCodec 離散編碼**——音頻被表示為 8 位的 EnCodec，後一層依次為前一層的殘差，最終 EnCodec 是 8 位相加。

![EnCodec 8 位殘差量化](/blogs/ai-tts/s33-valle-encodec.png?w=560)

**訓練和推理各有兩個模型**：一個**自迴歸 AR**，一個**非自迴歸 NAR**：

![VALL-E AR + NAR 雙模型結構](/blogs/ai-tts/s33-valle-ar-nar.png?w=440)

- 訓練時：AR 模型學習**第一位** EnCodec，NAR 模型學習**第 2–8 位**
- 推理時：先用 AR 預測第一位，再用 NAR 一次性預測 2–8 位

為什麼這樣切？

- 第一位作用最重要，需要 AR 做更準確的預測——而且 AR 還能順便完成"預測句長"的功能
- 全 AR 訓練太慢，NAR 並行訓練速度遠超 AR

論文原文的解釋：

> Because RVQ is employed, the first quantizer plays the most important role in reconstruction, and the impact from others gradually decreases.

### AudioLM（Google 2022）

![AudioLM 三階段架構](/blogs/ai-tts/s34-audiolm-1.png?w=400)

**仿照 NLP 預測下一個詞的自監督思想**，構建的純聲學模型。

- 訓練數據：**60,000 小時英語演講 + 40,000 小時鋼琴音樂**
- 語音/音樂數據構建**兩個標記模型**——一個標記文本/語義信息，一個標記聲學信息

**三階段訓練**：

![AudioLM 階段流](/blogs/ai-tts/s34-audiolm-2.png?w=340)

1. 第一階段只學習語義模型——根據歷史語義標記預測未來的語義標記
2. 第二階段把語義標記和聲學標記結合，預測未來的聲學標記
3. 第三階段對預測好的聲學標記做調整，使其更接近真實結果

**能力**：實現了對人聲、鋼琴聲的**續寫（Continuation）**——但生成的語音**不一定有含義**——因為它是無條件生成，只學"下一段聲音應該長什麼樣"，不學"下一段聲音應該說什麼"。

### EnCodec（Meta 2022）

順帶一提——VALL-E 用的 EnCodec 編解碼器本身也是 2022 年的工作。它是**一種利用神經網絡的最先進的實時、高保真音頻編解碼器**，用**單一多尺度頻譜圖判別器**來簡化和加速訓練，有效減少失真頻譜、產生高質量樣本。

EnCodec 是 VALL-E 這類"音頻語言模型"能落地的關鍵——沒有一個高質量的音頻 tokenizer，"預測下一個音頻 token"就無從談起。


## 應用

技術講完，看看當時（2023 年）已經落地的應用場景。

### 語音交互聊天機器人

**LLM + VITS + Live2D / MMD / Unity / 全息 / QQ 聊天機器人**——一個 GPT 類模型負責生成回覆文本，VITS 負責把文本讀出來，前端用 Live2D 或 MMD 模型做視覺呈現。

| Live2D | MMD | Unity | 全息 |
| --- | --- | --- | --- |
| ![Live2D](/blogs/ai-tts/s35-live2d.png?w=200) | ![MMD](/blogs/ai-tts/s35-mmd.png?w=200) | ![Unity](/blogs/ai-tts/s35-unity.png?w=200) | ![全息](/blogs/ai-tts/s35-full.png?w=140) |

這套棧已經能跑出相當不錯的 demo。

### 商業應用

**米哈遊《未定事件簿》**——某角色 CV 因經濟犯罪解除合同，之後的角色配音**全部由 AI 完成**。這是國內二次元遊戲行業第一次公開使用 AI 語音替代人類配音。

![《未定事件簿》AI 配音](/blogs/ai-tts/s36-mihoyo.png?w=280)

**Vtuber Neuro-sama**——一個真實的虛擬主播，Live2D 模型形象，使用 AI 語言模型即時與觀眾彈幕交流，直播內容包括 AI 玩遊戲、AI 唱歌。Twitch 上已有 34 萬粉絲（數據為 2023 年 6 月分享時）。

![Neuro-sama](/blogs/ai-tts/s36-neuro.png?w=280)

**VOCALOID**——日本雅馬哈公司開發的電子音樂製作語音合成軟件，輸入音調和歌詞就可以合成人聲歌聲。**2022 年 VOCALOID 6 發佈時宣佈正式引入 AI 引擎**——傳統規則驅動的音源正在被神經網絡驅動的音源取代。

![VOCALOID 6 AI](/blogs/ai-tts/s36-vocaloid.jpeg?w=280)


## 爭議

技術之外，AI 語音合成的社會側一直有兩個問題：

**AI 詐騙**——3 秒樣本即可複製音色（VALL-E 級別）——對電信詐騙是災難。真實案例中已經出現過用 AI 復刻子女聲音進行的電話詐騙。

![AI 詐騙相關報道](/blogs/ai-tts/s37-fraud.png?w=520)

**SoVITS 原作者刪庫**——原始項目 `github.com/innnky/so-vits-svc` 在"AI 孫燕姿"熱度頂峰時被作者本人刪除。作者的表態是——這項技術的倫理邊界還沒準備好承接它的應用規模。社區 fork 依然存在，但作者本人選擇退出。

![SoVITS 原倉庫刪除](/blogs/ai-tts/s37-delete.jpeg?w=480)


## 結語

從 2017 年的 Tacotron，到 2023 年的 VALL-E，語音合成經歷了三代範式：

1. **Tacotron / Tacotron 2 時代**：聲學模型 + 聲碼器兩段式，自迴歸、慢、但真正打通了端到端
2. **FastSpeech / VITS 時代**：非自迴歸、可控、單一模型端到端、GAN 全局訓練
3. **VALL-E / AudioLM 時代**：把音頻當 token，用語言模型範式做零樣本音色克隆

"AI 孫燕姿"能在 2023 年爆火，是這三代技術疊加的結果——VITS 提供了高質量的端到端框架，SoftVC 提供了內容/音色解耦的手段，社區開源讓個人可以在一張消費級 GPU 上訓出一個可用的音色模型。

技術已經跑到了這裡，剩下的問題——法律、倫理、版權、身份——才剛剛開始。

謝謝觀賞。
