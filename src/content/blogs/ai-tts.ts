export const body = `## 引入

这份分享是 2023 年 6 月做的。彼时"AI 孙燕姿"正在全网刷屏——用孙燕姿的音色去翻唱 Vitas 的《Opera 2》、周杰伦的《发如雪》、林俊杰的《一路向北》——听感几可乱真。

![AI 孙燕姿 相关翻唱作品](/blogs/ai-tts/s3-arknights.png?w=680)

孙燕姿本人后来在个人博客发了一篇声明《我的 AI》回应，说这波"AI 翻唱"是自己也没料到的事——态度里带着一丝哭笑不得的坦然。

![孙燕姿声明《我的 AI》](/blogs/ai-tts/s3-sunyanzi.jpeg?w=320)

热度背后的技术底座，是一个叫 **So-VITS-SVC** 的开源项目（SoftVC + VITS Singing Voice Conversion）。而 VITS 本身，是 2021 年 ICML 上的一篇端到端语音合成论文（Kim, J., Kong, J., Son, J., 2021. Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech）。想搞清楚"AI 孙燕姿"为什么突然可行，需要把语音合成这条技术线从头到尾梳理一遍。

### 时代背景

同时代的背景是 ChatGPT 已经引爆全球。B 站的 AI 相关视频发布量在 2023 年初出现指数级增长——

![B 站 AI 视频发布量（AI 语音 / AI 作画 / AI 对话）](/blogs/ai-tts/s4-bilibili-all.png?w=720)

上图能清楚看到三条时间线上的引爆点：

- **NovelAI**（2022-10 前后）→ AI 作画（橙色）率先起量
- **ChatGPT 发布**（2022-11-30）→ AI 对话（绿色）飙升
- **ChatGPT 引国内主流媒体热议**（2023-02）→ 绿色柱达到峰值
- **GPT-4 发布 + LoRA 训练教程流行**（2023-03 起）→ 三条线全面爆发

单看**AI 语音**这条线：

![B 站 AI 语音视频发布量](/blogs/ai-tts/s4-bilibili-voice.png?w=720)

从 2022 年 5 月的接近 0，到 2023 年 4 月的每周 400+ 条——刚好是这次分享的前夜。


## 智能语音的三个方向

先把"智能语音"这个大领域切开看：

![ASR / TTS / VC 三个方向](/blogs/ai-tts/s5-asr-tts-vc.png?w=520)

- **语音 → 文字**：Automatic Speech Recognition (ASR)，即语音识别
- **文字 → 语音**：Text-to-Speech Synthesis (TTS)，即语音合成
- **语音 → 语音**：Speech Separation & Voice Conversion (VC)，即语音分离与音色转换

"AI 孙燕姿"属于第三类——把一段人声的音色换成另一个人的，不改内容也不改旋律。但要理解 VC，得先理解 TTS，因为 VC 是从 TTS 的架构里长出来的。


## 语音信号基础知识

### 什么是声音

要做语音合成，先要理解语音这个信号本身是什么。

![声音三要素：响度、音调、音色](/blogs/ai-tts/s6-three-props.png?w=420)

声波通过空气传播，被麦克风接收，通过**模数转换器（ADC）**采样、量化转换为离散的数字信号——就是我们平时说的**波形文件**。

![声波与 ADC](/blogs/ai-tts/s6-adc.jpeg?w=180)

声音有三个基本属性：**响度（音量）、音调、音色**。

| 名词 | 含义 |
| --- | --- |
| 声波 | 通过空气传播，被麦克风接收，采样、量化后转为离散数字信号 |
| 能量 | 时域上每帧的能量，幅度的平方 |
| 短时能量 | 信号在不同时刻的强弱程度 |
| 声强 | 单位时间内通过垂直于声波传播方向的单位面积的平均声能，单位分贝（dB） |
| 响度（音量） | 主观心理量，人类感觉到的声音强弱，与声强和频率有关，单位方（phon） |
| 基频 | 基音周期的倒数，对应声带振动频率，代表音高。成年男性 100–250Hz，女性 150–350Hz |
| 谐波 | 基频对应的整数次频率成分，由声带发声带动空气共振形成，对应音色 |

有几个非直觉的点值得强调：

**人类可感知声音的频率大致在 20–20000Hz 之间**，但人类对基频的感知遵循**对数律**——也就是说，人们会感觉 100Hz 到 200Hz 的差距，和 200Hz 到 400Hz 的差距是相同的。这对后面要讲的**梅尔频谱**很关键。

**音色由什么决定？** 是谐波。基频决定音调，但决定"这是谁的声音"的，是基频之上那些整数倍的谐波成分的位置和相邻距离。So-VITS-SVC 换音色，本质上就是在换这些谐波结构。

### 音频数字信号的构成

三个关键参数：**采样位深、采样率、通道数**。

![CD / MP3 / DVD 等常见音频格式](/blogs/ai-tts/s7-cd-formats.png?w=680)

**采样位深**——每个样本所占比特数
- 16Bit：动态范围约 96dB，适用于普通流行歌曲
- 24Bit：动态范围约 144dB，用于电影配乐、交响乐团等大动态音频

**采样率**——每秒钟采样样本的总数
- 8KHz：电话
- 22.050KHz：无线电广播
- 44.1KHz：音频 CD、MP3
- 48KHz：miniDV、数字电视、DVD、电影和专业音频
- 96KHz / 192KHz：DVD-Audio、蓝光音轨

**通道数**——采集信号的条数：单声道、双声道（立体声）、2.1、5.1、7.1 声道等。

举个具体例子——用 librosa 读一个音频文件：

![librosa 读音频 - 波形](/blogs/ai-tts/s8-waveform.png?w=560)

- **采样位深 16bit**：\`2^15 = 32768\`，每个点的值在 \`[-32768, 32767]\`，librosa 会做归一化处理
- **采样率 48000Hz**：每秒 48000 个点
- **通道数 1**：1 条序列

**存储空间 = 采样位深 × 采样率 × 通道数 × 时长**

一个 5 秒的 48kHz 单声道音频，读出来是一个形状为 \`(239104,)\` 的数组。


## 语音特征提取

原始波形直接喂给神经网络，效果并不好——因为波形本身的信息密度很低，而且是**非平稳信号**。所以工业上普遍先做特征提取，把波形转成频域上更结构化的表示。

### 短时平稳特性

语音信号整体是非平稳的，但由于发浊音时声带**有规律**地振动，基音频率在**短时范围内**是相对固定的。因此可以认为语音信号具有**短时平稳特性**——一般认为 10ms 到 50ms 的语音信号片段是一个准稳态过程。

这个假设是所有后续处理的基石。

![音素、字素、发音、音节](/blogs/ai-tts/s9-phoneme.png?w=560)

顺便对齐几个术语：

| 名词 | 含义 |
| --- | --- |
| 音素（phoneme） | 也称音位，能够区别意义的最小语音单位。同一音素由不同人/环境读出，可以形成不同发音 |
| 字素（grapheme） | 音素对应的文本 |
| 发音（phone） | 某个音素的具体发音 |
| 音节（syllable） | 由音素组成，一个汉字就是一个音节 |

音位并不是一个实际的语音——它是心理上的等价类。一个音位可以有数种不同发音，语言使用者心理上认定它们等同，甚至察觉不到语音上的区别。这种音位内的不同发音叫做**同位异音**或**音位变体**。

**IPA（International Phonetic Alphabet，国际音标）** 是跨语言的音位标注体系：

![国际音标 IPA 表](/blogs/ai-tts/s10-ipa-chart.jpeg?w=320)

TTS 系统通常先把文本转成音位标注（拼音、注音、IPA），再从音位出发去合成声学信号。

### 预加重、分帧、加窗

从波形到频谱，中间要过三步预处理：

**预加重**：语音经过说话人的口唇辐射发出，受到唇端辐射抑制，高频能量明显降低。用一个一阶差分来补偿：

$$x'[n] = x[n] - a \\times x[n-1]$$

![预加重效果对比](/blogs/ai-tts/s11-preemphasis.png?w=280)

**分帧**：一般每帧帧长 20ms 或 50ms。相邻两帧之间的基音可能发生变化（如两个音节之间、声母向韵母过渡）。为确保声学特征的平滑性，采用**重叠取帧**——帧长和帧移的比例一般为 1:4 或 1:5。

![分帧示意](/blogs/ai-tts/s11-framing.png?w=280)

以 50ms 为帧长、1:4 的比例、48000Hz 采样率为例——一帧有 2400 个点，1 秒钟有 81 帧。

**加窗**：分帧本身相当于对语音信号加了矩形窗，矩形窗会在时域边界处产生多个旁瓣，引起**频谱泄露**。为了减少泄露，通常在分帧后加平滑窗——汉明（Hamming）窗、汉宁（Hanning）窗、布莱克曼（Blackman）窗都是常用选择。

![常用窗函数](/blogs/ai-tts/s11-window.png?w=520)

### 傅里叶变换与短时傅里叶变换

**傅里叶变换（FT）**：任何连续周期函数可以表示为一系列正弦和余弦函数的线性组合。借助欧拉公式，可以进一步把它写成复指数函数的积分——从实数域映射到复数域。

**短时傅里叶变换（STFT）**：把资料切割成大量互相重叠的帧，每组帧分别做傅里叶变换，得到每个时间点上的频率大小与相位信息。

![STFT 示意](/blogs/ai-tts/s12-stft.png?w=440)

![STFT 数学表达](/blogs/ai-tts/s12-formula.png?w=280)

用刚才的 239104 点音频做例子——帧长 2048、帧移 1/4，一共 \`239104/(2048/4)+1 = 468\` 帧。

![STFT 结果矩阵](/blogs/ai-tts/s13-stft-result.png?w=340)

STFT 结果形状是 \`(1025, 468)\`——每个元素是一个复数，表示 \`[振幅, 相位]\`。为什么频率维度是 1025？因为**奈奎斯特采样定理**：要从抽样信号中无失真地恢复原信号，抽样频率应大于 2 倍信号最高频率。所以最高频率对应的 bin 数是 \`2048/2+1 = 1025\`。

### 频谱与梅尔频谱

**频谱图（Spectrogram）**，又叫语谱图，是一种把音频信号在时间和频率上进行可视化的图形——横轴时间、纵轴频率、颜色深浅表示能量大小。这就是我们平时看到的"声音的样子"。

![语谱图示例](/blogs/ai-tts/s14-spectrogram.png?w=600)

![语谱图数据](/blogs/ai-tts/s14-spec-vis.png?w=400)

**梅尔频谱（Mel-Spectrogram）**：前面提过，人类对不同频率的语音有不同感知能力：

1. 1kHz 以下，人耳感知与频率成**线性**关系
2. 1kHz 以上，人耳感知与频率成**对数**关系

![Mel 刻度曲线](/blogs/ai-tts/s15-mel-curve.png?w=300)

也就是说，人耳对低频信号比高频信号更敏感。既然人耳如此，直接用线性频谱训练模型就是浪费——很多高频段的差异人根本听不出来。

![Mel scale 转换](/blogs/ai-tts/s15-mel-scale.png?w=200)

于是引入 **mel 刻度**：1 个 mel 刻度相当于人对 1kHz 音频感知程度的千分之一。mel 刻度表达的是从**线性频率**到**"感知频率"**的转换关系。梅尔频谱在低频段密、高频段稀，更贴合人耳的实际分辨力。

![梅尔频谱示例](/blogs/ai-tts/s15-mel-spec.png?w=420)

后面所有 TTS 模型输出的都是**梅尔频谱**，而不是原始波形——因为梅尔频谱是一个信息密度高、维度低、贴合听感的中间表示。


## TTS 模型总览

现代工业级神经网络语音合成系统，主要包括三个部分：

![TTS 三段式：文本前端 + 声学模型 + 声码器](/blogs/ai-tts/s16-tts-pipeline.png?w=720)

1. **文本前端**：文本输入进来，转换为音素、韵律边界等文本特征
2. **声学模型**：文本特征转换为对应的声学特征（通常是梅尔频谱）
3. **声码器（Vocoder）**：声学特征重建为原始波形

![TTS 各模块细节](/blogs/ai-tts/s16-tts-detail.png?w=720)

综述论文 *A Survey on Neural Speech Synthesis*（Tan et al., 2021）把这个领域按声学模型、声码器、端到端三大方向做了完整梳理：

![Neural TTS 综述 - 谱系图 1](/blogs/ai-tts/s17-tts-family1.png?w=600)

![Neural TTS 综述 - 谱系图 2](/blogs/ai-tts/s17-tts-family2.png?w=400)

后面按时间顺序过一遍这条线上的关键模型——从 2017 年的 Tacotron 到 2023 年的 VALL-E。

### 评估指标

在讲模型前，先说怎么评估合成语音的好坏。

**主观评价**：人类对语音打分，代表性指标：
- **MOS**（Mean Opinion Score，平均意见得分）
- **CMOS**（CrowdMOS，众包平均意见得分）
- **ABX 测试**

**客观评价**：通过计算机自动给出评估，比如**MCD**（Mel Cepstral Distortion，梅尔倒谱失真）。但客观评价在语音合成领域研究得比较少——原因很直接：**这个领域最终判官是人耳**。

国际电信联盟（ITU）把 MOS 评测规范化为 ITU-T P.800，其中**绝对等级评分（ACR）** 应用最广：

![ACR 评分标准（ITU-T P.800）](/blogs/ai-tts/s18-mos-table.png?w=680)


## Vocoder（声码器）

从梅尔频谱回到波形，有几种主流做法。

### Griffin-Lim 算法

**不需要训练**——通过帧与帧之间的关系估计相位信息，使用逆短时傅里叶变换迭代生成，重建语音波形。原理简单、速度快，但音质有限。Tacotron 1 用的就是它。

### WaveNet

Google 在 2016 年提出的深度神经网络声码器。可以使用模型生成的梅尔频谱来训练。

![WaveNet 膨胀因果卷积](/blogs/ai-tts/s19-wavenet.png?w=520)

WaveNet 最大的成功之处是使用 **dilated causal convolution（膨胀因果卷积）** 技术来增加 CNN 的感受野（receptive field），从而提升了模型建模 long dependency 的能力——语音波形的相关性可以跨越几千个采样点，普通 CNN 感受野不够，膨胀卷积用指数级扩张的孔洞覆盖长距离依赖，同时又保持了参数量可控。

WaveNet 是很多后续 TTS 系统的默认声码器，Tacotron 2 就是配 WaveNet 用的。


## Tacotron 系列

### Tacotron（Google 2017.03）

第一个真正意义上的端到端神经网络 TTS——Encoder + Decoder 结构。

![Tacotron 架构图](/blogs/ai-tts/s20-tacotron.png?w=680)

**核心组件 CBHG**——1-D convolution bank + highway network + bidirectional GRU。这个组件是 Tacotron 里最特色的部分。

![CBHG 模块](/blogs/ai-tts/s20-cbhg.png?w=260)

**流程**：
- 文本 → Encoder → hidden representation
- Hidden representation → Decoder → mel 频谱
- mel 频谱 → Griffin-Lim → 波形

**Encoder**：Pre-net + CBHG
- Pre-net：全连接层 + dropout
- CBHG：卷积 + 池化 + 残差链接 + 双向 GRU，输入序列、输出序列

**Decoder**：双层 GRU，分为 attention decoder 和 output decoder
- Attention decoder 生成 query vector 作为 attention 输入
- Output decoder 把 query vector 和 context vector 一起输入
- 每一步预测多个 frame（加速收敛）
- 最后把 mel 频谱转为线性频谱，用 Griffin-Lim 生成最终波形

### Tacotron 2（Google 2017.12）

![Tacotron 2 架构图](/blogs/ai-tts/s21-tacotron2.png?w=420)

在 Tacotron 基础上做了几处关键改动：

- 抛弃 CBHG，改用普通的 **LSTM + 卷积**
- Decoder 每一步只预测一个 frame
- 增加 **Post-net** 精调 mel 谱
- 换用更强的 Vocoder（**WaveNet**）

![Tacotron 2 细节](/blogs/ai-tts/s21-tacotron2-arch.png?w=560)

**Encoder**：字符/音素编码 → 三层卷积 → 双向 LSTM → 保持维度不变

**Decoder**：mel 谱 → Pre-net → LSTM
- 一条路和文本输出做 attention，找对应关系
- 一条路和自己做卷积，提取 mel 谱自身的特征
- 两条路合并
- 一条路判断是否要 stop
- 一条路走 5 层 Post-net 卷积，得到最终 mel 谱

Tacotron 2 是 2017 年到 2019 年之间事实上的 TTS 标杆。


## FastSpeech 系列

### FastSpeech（Microsoft 2019）

Tacotron 2 有几个明显问题：

- **合成速度慢**——自回归模型必须一帧一帧生成
- **不够稳健**（robust）——序列模型的错误传播
- **缺乏控制手段**——无法控制语速或韵律

![FastSpeech 架构](/blogs/ai-tts/s22-fastspeech.png?w=600)

FastSpeech 的核心思路是**非自回归**——一次性并行输出整段 mel 谱。为此需要提前知道每个音素对应几个 frame，于是引入两个关键模块：

![FastSpeech Duration Predictor / Length Regulator](/blogs/ai-tts/s22-fastspeech-detail.png?w=380)

**Duration Predictor**：训练时用一个自回归模型生成 mel 谱，与真实 mel 谱顺序对应，根据差距训练每个音素的 duration。Inference 时**不用自回归**，直接预测——加快速度。

**Length Regulator**：预测一个音素对应几个 frame，生成时把对应的 mel 谱重复多次。有超参数可以调节——**这就带来了控制语速的能力**。

### FastSpeech 2（Microsoft 2020）

![FastSpeech 2 架构](/blogs/ai-tts/s23-fastspeech2.png?w=520)

FastSpeech 2 除了 Duration Predictor，又增加了 **Energy Predictor**、**Pitch Predictor** 等多个模块——每一个模块都是一维的可控信号，直接注入到中间表示里。这让韵律、能量、音高都变得可控。

![FastSpeech 2s：直出波形](/blogs/ai-tts/s23-fastspeech2s.png?w=300)

**FastSpeech 2s** 版本更激进——输出结果从 mel 谱改为**波形谱**，声学模型和声码器合二为一。


## VITS：端到端的胜利

### VITS（KAIST & Kakao 2021）

**Variational Inference with adversarial learning for end-to-end Text-to-Speech**

这是这场分享的核心模型。VITS 把三个强大的生成模型思想缝在了一起：**VAE + Flow + GAN**。

![VITS 训练 / 推理架构](/blogs/ai-tts/s24-vits-arch.png?w=720)

三条设计原则：

1. VITS 框架包含两个子系统——基于 **VAE** 的变声系统 + 基于 **Flow** 的语音合成系统。VAE 擅长捕捉句子**整体**的韵律特征，Flow 擅长重建音频的**细节**特征。两者整合，多任务训练，参数与优势共享。

2. VITS 的语音合成系统**直接合成音频**而不是 MEL 谱——实现真正的端到端合成，而非"声学模型 + 声码器"的两段式。这样消除了两个模型之间的 gap（分段训练常见的失配问题）。

3. 传统 TTS 中，GAN 训练只应用于声码器；而 VITS 里 GAN 训练是**全局**的、对每个模块都有效——判别器对生成波形整体打分。

### Generative Model 快速回顾

在展开 VITS 结构前，先对齐几个基础生成模型：

![GAN / VAE / Flow / Diffusion / AR 概览](/blogs/ai-tts/s25-gen-models.png?w=580)

- **GAN**：训练生成器（Generator）的同时训练判别器（Discriminator），两者极小极大博弈，相互变强
- **VAE**：无监督训练一个神经网络，Encoder 把原始输入压缩成中间表示，Decoder 从编码中重建
- **FLOW**：假设原始数据分布可以通过一系列**可逆**转化函数从已知分布获得。通过雅可比行列式和变量变化规则，可以直接估计真实数据的概率密度
- **Diffusion Models**：定义正向和逆向两个过程。正向从真实分布采样，逐步加高斯噪声；逆向从噪声开始学一个模型估计条件概率，把噪声一步步还原

### 变分自编码器 VAE

VAE 是 VITS 中最核心的组件，值得单独讲一下。

![标准自编码器](/blogs/ai-tts/s26-ae.png?w=420)

**标准自编码器**：把 X 编码成低维的 Z，再解码成 X'。目标是让 X' 尽量接近 X。

![变分自编码器 VAE](/blogs/ai-tts/s26-vae.png?w=420)

**VAE 的关键区别**：Z 不是一个固定值，而是一个**分布**（通常参数化为高斯的 μ 和 σ）。通过对 Z 采样，可以生成**原来数据集里不存在**的 X'——这就有了生成能力。

![VAE 数学推导](/blogs/ai-tts/s26-vae-math.png?w=500)

VAE 用神经网络来模仿真实的 \`p(Z|X)\`。经过数学推导，损失函数可以拆成两项：

- **重建误差**：Decoder 生成的 X 与原来 X 尽可能接近
- **KL 散度**：Encoder 学习的 Z 分布与真实 Z 的先验分布尽可能相似（真实 Z 的先验定义为**标准正态**）

这两项一个约束"能不能还原"，一个约束"Z 空间是不是良态"。

### VITS 的结构

VITS 的完整数据流：

**先验编码器**：文本 → transformer → 带 μ, σ 的分布 → 通过对齐矩阵 A → 隐变量 Z

**后验编码器**：线性谱 → Encoder → 通过 Flow 的变化函数 → 隐变量 Z

**训练目标**：让这两个隐变量尽可能接近（KL 散度）

**随机时长预测器**：单独一个模块，学习对齐矩阵 A

**解码器**：从隐变量 Z 生成波形

**判别器**：单独一个模块，判别波形真伪

**Inference 时**：文本 → 编码器 → Z 的分布 → 随机时长预测器 → Flow 的逆变换 → Z → 解码器 → 波形

### VITS 的效果

![VITS vs Tacotron 2 / Glow-TTS MOS 对比](/blogs/ai-tts/s28-vits-mos.png?w=480)

VITS 的 MOS 达到 **4.43**（Ground Truth 是 4.46），已经非常逼近真人配音的听感极限。

各 loss 项：

- \`L_recon\`：生成内容的梅尔谱与真实梅尔谱的 L1 loss（重构 loss）
- \`L_kl\`：从线性谱得到的隐变量 z 与从文本+对齐矩阵得到的隐变量 z 的 KL 散度
- \`L_dur\`：随机时长预测器的模型 loss
- \`L_adv(G)\`：判别器将生成内容判别为真的 loss
- \`L_fm(G)\`：判别器的中间输出——让生成内容和真实内容在判别器内部的中间层特征也接近

多个 loss 联合训练，让每个子模块都被推向正确方向。


## So-VITS-SVC：AI 孙燕姿的技术底座

**SoftVC + VITS**——SoVITS 的名字就是拼出来的。

![SoftVC 内容编码器（discrete vs soft）](/blogs/ai-tts/s29-sovits-arch.png?w=720)

原始 GitHub 仓库是 \`github.com/innnky/so-vits-svc\`（后来作者删库了），社区接手的版本在 \`github.com/svc-develop-team/so-vits-svc\`。

**核心思路**：在文本 Encoder 里加一层 ASR（**HuBERT**：基于 BERT 的自监督语音表示学习），只传递**文本信息**（内容），**不传递音色信息**——然后用目标歌手的音色去解码。

这样做的效果是——输入一段任意人的干声（比如某个 UP 主翻唱周杰伦），HuBERT 抽出内容信息，VITS 的解码器用孙燕姿的声学模型重建波形——就得到了"孙燕姿唱的这首歌"。

### 示例

自己训了一个模型作为演示。数据规模：

- **600+ 条，1–10 秒的语音**——素材来自米哈游游戏《原神》里的角色**神里绫华**
- **训练硬件**：RTX A5000 (24GB) × 1
- **训练时长**：约 48 小时

![神里绫华 立绘](/blogs/ai-tts/ayaka.jpeg?w=360)

角色设定简介——稻妻国（原型为幕府时期日本）神里家的大小姐，负责神社、庆典及文化事务的管理。

下面是**文本原声（真人配音演员录制）**与 **VITS 生成**的对照。同一段文本喂给两边，直接用耳朵比对：

<div class="ab-list">

<div class="ab-item">
<p class="ab-text">晚上好。夜风舒畅，会是一个良宵呢。</p>
<div class="ab-row"><span class="ab-label">原声</span><audio controls preload="none" src="/blogs/ai-tts/orig-1.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-1.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">不不……你过奖了，我只是完成应尽之事。</p>
<div class="ab-row"><span class="ab-label">原声</span><audio controls preload="none" src="/blogs/ai-tts/orig-2.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-2.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">「雪霁银妆素，桔高映琼枝。」嗯……美景当前，只差一壶茶与之相衬呢。</p>
<div class="ab-row"><span class="ab-label">原声</span><audio controls preload="none" src="/blogs/ai-tts/orig-3.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-3.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">啊、啊……等一下！请先……先别走……</p>
<div class="ab-row"><span class="ab-label">原声</span><audio controls preload="none" src="/blogs/ai-tts/orig-4.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-4.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">若知是梦何须醒，不比真如一相会。</p>
<div class="ab-row"><span class="ab-label">原声</span><audio controls preload="none" src="/blogs/ai-tts/orig-5.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-5.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">作为神里家的家主，兄长平日需要出面诸多场合。我虽尽力分担兄长肩上所负担的责任，却也无法缓和他常年积压在身的疲倦。</p>
<div class="ab-row"><span class="ab-label">原声</span><audio controls preload="none" src="/blogs/ai-tts/orig-6.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-6.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">「坦率」，真的是一件很难的事情。我必须不断告诫自己是神里家的大小姐，在无数双眼睛，无数人的期盼之下摆出完美无缺的姿态。</p>
<div class="ab-row"><span class="ab-label">原声</span><audio controls preload="none" src="/blogs/ai-tts/orig-7.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-7.wav"></audio></div>
</div>

</div>

听感上音色的相似度相当高——起伏、气息、断句都拟得住。600 条数据 + 单张 A5000 训 48 小时，2023 年 6 月的开源栈已经能做到这个水平。


## VALL-E 与 AudioLM：语言模型范式

进入 2022–2023 年，语音合成开始被 NLP 的范式重构——**把音频当作 token 序列，用 GPT 那一套预测下一个 token**。这个方向上两个代表工作。

### VALL-E（Microsoft 2023）

![VALL-E 总览](/blogs/ai-tts/s31-valle.jpeg?w=560)

- 训练集：**60K 小时**英文语音，**7000** 个声源
- Zero-shot：**只需 3 秒**的样本即可复制目标音色
- 架构范式转变：以往是**音素 → mel 谱 → 波形**；VALL-E 是**音素 → 离散编码 → 波形**

**核心是 EnCodec 离散编码**——音频被表示为 8 位的 EnCodec，后一层依次为前一层的残差，最终 EnCodec 是 8 位相加。

![EnCodec 8 位残差量化](/blogs/ai-tts/s33-valle-encodec.png?w=560)

**训练和推理各有两个模型**：一个**自回归 AR**，一个**非自回归 NAR**：

![VALL-E AR + NAR 双模型结构](/blogs/ai-tts/s33-valle-ar-nar.png?w=440)

- 训练时：AR 模型学习**第一位** EnCodec，NAR 模型学习**第 2–8 位**
- 推理时：先用 AR 预测第一位，再用 NAR 一次性预测 2–8 位

为什么这样切？

- 第一位作用最重要，需要 AR 做更准确的预测——而且 AR 还能顺便完成"预测句长"的功能
- 全 AR 训练太慢，NAR 并行训练速度远超 AR

论文原文的解释：

> Because RVQ is employed, the first quantizer plays the most important role in reconstruction, and the impact from others gradually decreases.

### AudioLM（Google 2022）

![AudioLM 三阶段架构](/blogs/ai-tts/s34-audiolm-1.png?w=400)

**仿照 NLP 预测下一个词的自监督思想**，构建的纯声学模型。

- 训练数据：**60,000 小时英语演讲 + 40,000 小时钢琴音乐**
- 语音/音乐数据构建**两个标记模型**——一个标记文本/语义信息，一个标记声学信息

**三阶段训练**：

![AudioLM 阶段流](/blogs/ai-tts/s34-audiolm-2.png?w=340)

1. 第一阶段只学习语义模型——根据历史语义标记预测未来的语义标记
2. 第二阶段把语义标记和声学标记结合，预测未来的声学标记
3. 第三阶段对预测好的声学标记做调整，使其更接近真实结果

**能力**：实现了对人声、钢琴声的**续写（Continuation）**——但生成的语音**不一定有含义**——因为它是无条件生成，只学"下一段声音应该长什么样"，不学"下一段声音应该说什么"。

### EnCodec（Meta 2022）

顺带一提——VALL-E 用的 EnCodec 编解码器本身也是 2022 年的工作。它是**一种利用神经网络的最先进的实时、高保真音频编解码器**，用**单一多尺度频谱图判别器**来简化和加速训练，有效减少失真频谱、产生高质量样本。

EnCodec 是 VALL-E 这类"音频语言模型"能落地的关键——没有一个高质量的音频 tokenizer，"预测下一个音频 token"就无从谈起。


## 应用

技术讲完，看看当时（2023 年）已经落地的应用场景。

### 语音交互聊天机器人

**LLM + VITS + Live2D / MMD / Unity / 全息 / QQ 聊天机器人**——一个 GPT 类模型负责生成回复文本，VITS 负责把文本读出来，前端用 Live2D 或 MMD 模型做视觉呈现。

| Live2D | MMD | Unity | 全息 |
| --- | --- | --- | --- |
| ![Live2D](/blogs/ai-tts/s35-live2d.png?w=200) | ![MMD](/blogs/ai-tts/s35-mmd.png?w=200) | ![Unity](/blogs/ai-tts/s35-unity.png?w=200) | ![全息](/blogs/ai-tts/s35-full.png?w=140) |

这套栈已经能跑出相当不错的 demo。

### 商业应用

**米哈游《未定事件簿》**——某角色 CV 因经济犯罪解除合同，之后的角色配音**全部由 AI 完成**。这是国内二次元游戏行业第一次公开使用 AI 语音替代人类配音。

![《未定事件簿》AI 配音](/blogs/ai-tts/s36-mihoyo.png?w=280)

**Vtuber Neuro-sama**——一个真实的虚拟主播，Live2D 模型形象，使用 AI 语言模型即时与观众弹幕交流，直播内容包括 AI 玩游戏、AI 唱歌。Twitch 上已有 34 万粉丝（数据为 2023 年 6 月分享时）。

![Neuro-sama](/blogs/ai-tts/s36-neuro.png?w=280)

**VOCALOID**——日本雅马哈公司开发的电子音乐制作语音合成软件，输入音调和歌词就可以合成人声歌声。**2022 年 VOCALOID 6 发布时宣布正式引入 AI 引擎**——传统规则驱动的音源正在被神经网络驱动的音源取代。

![VOCALOID 6 AI](/blogs/ai-tts/s36-vocaloid.jpeg?w=280)


## 争议

技术之外，AI 语音合成的社会侧一直有两个问题：

**AI 诈骗**——3 秒样本即可复制音色（VALL-E 级别）——对电信诈骗是灾难。真实案例中已经出现过用 AI 复刻子女声音进行的电话诈骗。

![AI 诈骗相关报道](/blogs/ai-tts/s37-fraud.png?w=520)

**SoVITS 原作者删库**——原始项目 \`github.com/innnky/so-vits-svc\` 在"AI 孙燕姿"热度顶峰时被作者本人删除。作者的表态是——这项技术的伦理边界还没准备好承接它的应用规模。社区 fork 依然存在，但作者本人选择退出。

![SoVITS 原仓库删除](/blogs/ai-tts/s37-delete.jpeg?w=480)


## 结语

从 2017 年的 Tacotron，到 2023 年的 VALL-E，语音合成经历了三代范式：

1. **Tacotron / Tacotron 2 时代**：声学模型 + 声码器两段式，自回归、慢、但真正打通了端到端
2. **FastSpeech / VITS 时代**：非自回归、可控、单一模型端到端、GAN 全局训练
3. **VALL-E / AudioLM 时代**：把音频当 token，用语言模型范式做零样本音色克隆

"AI 孙燕姿"能在 2023 年爆火，是这三代技术叠加的结果——VITS 提供了高质量的端到端框架，SoftVC 提供了内容/音色解耦的手段，社区开源让个人可以在一张消费级 GPU 上训出一个可用的音色模型。

技术已经跑到了这里，剩下的问题——法律、伦理、版权、身份——才刚刚开始。

谢谢观赏。
`;
