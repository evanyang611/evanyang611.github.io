## 導入

この発表は 2023 年 6 月に行いました。当時、「AI 孫燕姿」のカバー動画がネットを席巻していました。Vitas の『Opera 2』、周杰倫の『髪如雪』、林俊傑の『一路向北』を孫燕姿の声で歌わせるもので、本人の歌声と区別しにくいほどでした。

![「AI 孫燕姿」のカバー動画](/blogs/ai-tts/s3-arknights.png?w=680)

孫燕姿本人も、個人ブログの『私の AI』という文章で反応しました。本人にとっても予想外のブームで、驚きつつも受け止めるような姿勢が見られました。

![孫燕姿の声明『私の AI』](/blogs/ai-tts/s3-sunyanzi.jpeg?w=320)

技術の土台となったのは、オープンソースの **So-VITS-SVC**（SoftVC + VITS Singing Voice Conversion）です。VITS は、ICML 2021 のエンドツーエンド音声合成の論文、Kim, J., Kong, J., Son, J., Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech に由来します。「AI 孫燕姿」が急に実現可能になった理由を理解するため、音声合成の流れを振り返ります。

### 当時の背景

ChatGPT が世界的に注目され、Bilibili でも 2023 年初頭に AI 関連動画の投稿数が急増しました。

![Bilibili の AI 動画投稿数：音声・画像・対話](/blogs/ai-tts/s4-bilibili-all.png?w=720)

図から、3 つの分野での転機がわかります。

- **NovelAI**（2022 年 10 月頃）：オレンジで示す AI 画像生成が先に伸びる。
- **ChatGPT の公開**（2022-11-30）：緑で示す AI 対話が急増する。
- **中国の主要メディアによる ChatGPT 報道**（2023 年 2 月）：緑の棒がピークに達する。
- **GPT-4 の公開と LoRA 学習教材の普及**（2023 年 3 月以降）：3 分野すべてが急成長する。

**AI 音声**だけを見ると：

![Bilibili の AI 音声動画投稿数](/blogs/ai-tts/s4-bilibili-voice.png?w=720)

2022 年 5 月にはほぼゼロだった投稿が、2023 年 4 月には週 400 本以上へ増えています。ちょうど、この発表の直前でした。


## 音声 AI の 3 つの方向

まず、音声 AI を 3 分野に分けます。

![ASR・TTS・VC の 3 分野](/blogs/ai-tts/s5-asr-tts-vc.png?w=520)

- **音声 → 文字：** Automatic Speech Recognition（ASR）、音声認識。
- **文字 → 音声：** Text-to-Speech Synthesis（TTS）、音声合成。
- **音声 → 音声：** Speech Separation & Voice Conversion（VC）、音声分離・声質変換。

「AI 孫燕姿」は 3 つ目に属し、内容やメロディーを変えずに声質だけを別の人へ変換します。VC は TTS の構成から発展したため、先に TTS を理解する必要があります。


## 音声信号の基礎

### 音とは

音声を合成するには、まず信号としての音を理解する必要があります。

![音の 3 要素：大きさ・高さ・音色](/blogs/ai-tts/s6-three-props.png?w=420)

音波は空気を伝わり、マイクで受け取られます。**アナログ・デジタル変換器（ADC）**で標本化・量子化され、離散的なデジタル信号、つまり**波形ファイル**になります。

![音波と ADC](/blogs/ai-tts/s6-adc.jpeg?w=180)

基本的な性質は、**大きさ（音量）・高さ・音色**の 3 つです。

| 用語 | 意味 |
| --- | --- |
| 音波 | 空気中を伝わり、マイクで受け取り、標本化・量子化してデジタル信号へ変換する。 |
| エネルギー | 時間領域の各フレームのエネルギー。振幅の二乗に関係する。 |
| 短時間エネルギー | 時間ごとの信号の強さ。 |
| 音の強度 | 伝播方向に垂直な単位面積を単位時間に通過する平均音響エネルギー。単位は dB。 |
| ラウドネス | 人が主観的に感じる大きさ。強度と周波数に関係し、単位は phon。 |
| 基本周波数 | 基本周期の逆数で、声帯の振動と音高に対応する。成人男性は 100〜250 Hz、女性は 150〜350 Hz 程度。 |
| 倍音 | 基本周波数の整数倍の成分。声帯と空気の共振で生じ、音色を形作る。 |

直感と少し違う点もあります。

**人が聞ける範囲はおよそ 20〜20000 Hz**ですが、音高の知覚は**対数的**です。100→200 Hz と 200→400 Hz の差を同じように感じます。これは後の**メルスペクトログラム**で重要になります。

**音色を決めるのは何か？** 倍音です。基本周波数が高さを決め、整数倍の倍音の位置や間隔が「誰の声か」を決めます。So-VITS-SVC による声質変換は、こうした倍音構造の変換に当たります。

### デジタル音声の構成

重要なパラメータは、**ビット深度・サンプリングレート・チャネル数**です。

![CD・MP3・DVD などの音声形式](/blogs/ai-tts/s7-cd-formats.png?w=680)

**ビット深度：** 1 サンプルに使うビット数。
- 16 bit：ダイナミックレンジは約 96 dB。一般的なポップスに適する。
- 24 bit：約 144 dB。映画音楽や交響曲など、強弱の幅が広い音声に使う。

**サンプリングレート：** 1 秒間のサンプル数。
- 8 kHz：電話。
- 22.050 kHz：ラジオ放送。
- 44.1 kHz：音楽 CD・MP3。
- 48 kHz：miniDV、デジタルテレビ、DVD、映画、業務用音声。
- 96 / 192 kHz：DVD-Audio・Blu-ray の音声。

**チャネル数：** 信号の本数。モノラル、ステレオ、2.1、5.1、7.1 チャネルなど。

librosa で音声を読む例です。

![librosa で読み込んだ波形](/blogs/ai-tts/s8-waveform.png?w=560)

- **16 bit：** `2^15 = 32768`。値は `[-32768, 32767]` の範囲で、librosa が正規化する。
- **48000 Hz：** 1 秒間に 48000 点。
- **1 チャネル：** 1 本の系列。

**保存容量 = ビット深度 × サンプリングレート × チャネル数 × 時間。**

5 秒の 48 kHz モノラル音声を読むと、形状 `(239104,)` の配列になります。


## 音声の特徴抽出

生の波形をそのままニューラルネットワークへ入れてもうまくいきません。情報密度が低く、**非定常な信号**だからです。そこで一般には特徴を抽出し、周波数領域の構造化された表現へ変換します。

### 短時間の定常性

音声全体は非定常ですが、有声音では声帯が**規則的に**振動し、短時間なら基本周波数が比較的安定します。およそ 10〜50 ms の区間を**準定常**とみなせます。

この仮定が、以降の処理の基礎です。

![音素・書記素・音声・音節](/blogs/ai-tts/s9-phoneme.png?w=560)

関連する用語を整理します。

| 用語 | 意味 |
| --- | --- |
| 音素（phoneme） | 意味を区別する最小の音の単位。同じ音素でも、話者や環境で発音が変わる。 |
| 書記素（grapheme） | 音素に対応する文字表現。 |
| 単音（phone） | 音素の具体的な発音。 |
| 音節（syllable） | 音素から構成される単位。ここでは漢字 1 字が 1 音節に対応する。 |

音素は実際の音そのものではなく、頭の中の同値類です。発音が違っても同じ音素と認識し、差に気づかない場合もあります。この発音の変種を**異音**と呼びます。

**IPA（国際音声記号）**は、言語をまたいで音を表記する体系です。

![国際音声記号の表](/blogs/ai-tts/s10-ipa-chart.jpeg?w=320)

TTS は通常、文字をピンイン、注音、IPA などの音声表記に変え、それを基に音響信号を合成します。

### プリエンファシス・フレーム分割・窓関数

波形から周波数表現へ進む前に、3 つの処理を行います。

**プリエンファシス：** 唇からの放射で高周波のエネルギーが弱くなるため、一次差分で補償します。

$$x'[n] = x[n] - a \times x[n-1]$$

![プリエンファシスの比較](/blogs/ai-tts/s11-preemphasis.png?w=280)

**フレーム分割：** 通常 20 ms や 50 ms ごとに分割します。音節間や子音・母音の遷移で基本周波数が変わるため、**フレームを重ねて**特徴を滑らかにします。フレーム長とシフトの比は一般に 1:4 や 1:5 です。

![フレーム分割の図](/blogs/ai-tts/s11-framing.png?w=280)

50 ms のフレーム、1:4 の比、48000 Hz の例では、1 フレームに 2400 点、1 秒間に 81 フレームがあります。

**窓関数：** 分割だけでは矩形窓をかけた状態になり、端でサイドローブが発生して**スペクトル漏れ**が起きます。抑えるために Hamming、Hann、Blackman などの滑らかな窓を使います。

![代表的な窓関数](/blogs/ai-tts/s11-window.png?w=520)

### フーリエ変換と短時間フーリエ変換

**フーリエ変換（FT）：** 周期関数を正弦・余弦の組み合わせで表します。オイラーの公式で複素指数関数の積分へ書き換え、実数領域から複素数領域へ移します。

**短時間フーリエ変換（STFT）：** 重なり合うフレームごとに変換し、各時刻の周波数の強さと位相を得ます。

![STFT の概念図](/blogs/ai-tts/s12-stft.png?w=440)

![STFT の式](/blogs/ai-tts/s12-formula.png?w=280)

先ほどの 239104 点、フレーム長 2048、シフト 1/4 の例では、`239104/(2048/4)+1 = 468` フレームになります。

![STFT の結果行列](/blogs/ai-tts/s13-stft-result.png?w=340)

結果は `(1025, 468)`。各要素は振幅と位相を表す複素数です。周波数方向が 1025 なのは、**ナイキストの標本化定理**により、復元のために最大周波数の 2 倍を超える標本化周波数が必要だからです。bin 数は `2048/2+1 = 1025` になります。

### スペクトログラムとメルスペクトログラム

**スペクトログラム：** 横軸が時間、縦軸が周波数、色の濃さがエネルギーを表す図です。音声の「見た目」といえます。

![スペクトログラムの例](/blogs/ai-tts/s14-spectrogram.png?w=600)

![スペクトログラムのデータ](/blogs/ai-tts/s14-spec-vis.png?w=400)

**メルスペクトログラム：** 耳の周波数に対する感度を反映します。

1. 1 kHz 以下では、知覚は周波数にほぼ**線形**に対応する。
2. 1 kHz 以上では、ほぼ**対数的**に対応する。

![メル尺度の曲線](/blogs/ai-tts/s15-mel-curve.png?w=300)

耳は低い周波数の違いに敏感です。線形の周波数表現では、人に聞き分けられない高周波の差にも同じ重みを与えてしまいます。

![メル尺度への変換](/blogs/ai-tts/s15-mel-scale.png?w=200)

**メル尺度**は、線形の周波数を知覚上の周波数へ変換し、1 kHz を 1000 mel とします。低周波では密、高周波では疎な表現にして、人の聞き分け方に近づけます。

![メルスペクトログラムの例](/blogs/ai-tts/s15-mel-spec.png?w=420)

続いて扱う TTS では、生の波形ではなく**メルスペクトログラム**を中間表現として使います。情報密度が高く、次元が小さく、聴感に合った表現です。


## TTS モデルの全体像

実用的なニューラル音声合成システムは、主に 3 つの部分からなります。

![TTS の 3 段階：文字の前処理・音響モデル・ボコーダー](/blogs/ai-tts/s16-tts-pipeline.png?w=720)

1. **テキストフロントエンド：** 文字を音素、韻律の境界などの特徴へ変える。
2. **音響モデル：** 文字の特徴を、通常はメルスペクトログラムなどの音響特徴へ変える。
3. **ボコーダー：** 音響特徴から波形を復元する。

![TTS 各モジュールの詳細](/blogs/ai-tts/s16-tts-detail.png?w=720)

総説 *A Survey on Neural Speech Synthesis*（Tan et al., 2021）は、音響モデル、ボコーダー、エンドツーエンドの 3 方向で分野を整理しています。

![ニューラル TTS の系統図 1](/blogs/ai-tts/s17-tts-family1.png?w=600)

![ニューラル TTS の系統図 2](/blogs/ai-tts/s17-tts-family2.png?w=400)

2017 年の Tacotron から 2023 年の VALL-E まで、時系列に沿って見ていきます。

### 評価指標

モデルの前に、合成音声の良し悪しをどう評価するかを確認します。

**主観評価：** 人が音声を採点します。代表的な指標は：
- **MOS：** Mean Opinion Score、平均評定値。
- **CMOS：** CrowdMOS、クラウドソーシングによる平均評価。
- **ABX テスト。**

**客観評価：** **MCD**（メルケプストラム歪み）などで自動評価します。ただし音声合成では客観評価の研究は比較的少なく、**最後に判断するのは人の耳**だからです。

ITU は MOS 評価を ITU-T P.800 として標準化し、**絶対カテゴリ評定（ACR）**が広く使われています。

![ITU-T P.800 の ACR 評価基準](/blogs/ai-tts/s18-mos-table.png?w=680)


## ボコーダー

メルスペクトログラムから波形へ戻す方法には、いくつかの代表例があります。

### Griffin–Lim アルゴリズム

**学習不要。** フレーム間の関係から位相を推定し、逆 STFT を繰り返して波形を復元します。単純で高速ですが、音質には限界があります。Tacotron 1 が使っています。

### WaveNet

Google が 2016 年に提案したニューラルボコーダー。モデルが生成したメルスペクトログラムで学習できます。

![WaveNet の拡張因果畳み込み](/blogs/ai-tts/s19-wavenet.png?w=520)

重要な点は **dilated causal convolution（拡張因果畳み込み）**で CNN の受容野を広げ、長期依存を扱えることです。音声の相関は数千サンプルに及ぶため、通常の CNN では範囲が足りません。間隔を指数的に広げ、パラメータ数を抑えながら長距離を扱います。

WaveNet は Tacotron 2 を含む、後続の多くの TTS のボコーダーとして使われました。


## Tacotron 系列

### Tacotron（Google、2017 年 3 月）

エンコーダー・デコーダー構成の、初期のエンドツーエンドニューラル TTS です。

![Tacotron の構成](/blogs/ai-tts/s20-tacotron.png?w=680)

特徴的なのは **CBHG：1-D convolution bank + highway network + bidirectional GRU** です。

![CBHG モジュール](/blogs/ai-tts/s20-cbhg.png?w=260)

**処理の流れ：**
- テキスト → エンコーダー → 隠れ表現。
- 隠れ表現 → デコーダー → メルスペクトログラム。
- メルスペクトログラム → Griffin–Lim → 波形。

**エンコーダー：** Pre-net + CBHG。
- Pre-net：全結合層 + dropout。
- CBHG：畳み込み、プーリング、残差接続、双方向 GRU。系列を入力し、系列を出力する。

**デコーダー：** 2 層の GRU。attention decoder と output decoder に分かれます。
- Attention decoder が注意計算の query vector を作る。
- Output decoder に query vector と context vector を入れる。
- 1 ステップで複数フレームを予測し、収束を速める。
- 最後にメルを線形スペクトログラムへ変え、Griffin–Lim で波形を作る。

### Tacotron 2（Google、2017 年 12 月）

![Tacotron 2 の構成](/blogs/ai-tts/s21-tacotron2.png?w=420)

主な変更点：

- CBHG をやめ、通常の **LSTM と畳み込み**を使う。
- デコーダーの各ステップで 1 フレームだけを予測する。
- **Post-net** でメルスペクトログラムを整える。
- より強い **WaveNet** を使う。

![Tacotron 2 の詳細](/blogs/ai-tts/s21-tacotron2-arch.png?w=560)

**エンコーダー：** 文字・音素の符号化 → 3 層の畳み込み → 双方向 LSTM。次元は維持します。

**デコーダー：** メルスペクトログラム → Pre-net → LSTM。
- 一方でテキストへの attention を計算し、対応を探す。
- もう一方で畳み込みによりメルの特徴を抽出する。
- 2 つを統合する。
- 一方の分岐で終了を判定する。
- もう一方で 5 層の Post-net を通し、最終的なメルを作る。

2017〜2019 年、Tacotron 2 は事実上の TTS の基準でした。


## FastSpeech 系列

### FastSpeech（Microsoft、2019）

Tacotron 2 の主な問題：

- **合成が遅い：** 自己回帰のため、1 フレームずつ生成する。
- **安定性が弱い：** 系列中で誤差が伝播する。
- **制御しにくい：** 速度や韻律を調整できない。

![FastSpeech の構成](/blogs/ai-tts/s22-fastspeech.png?w=600)

中心となる考え方は**非自己回帰**で、メル全体を並列に出力します。そのため各音素のフレーム数を知る必要があり、2 つのモジュールを導入します。

![Duration Predictor と Length Regulator](/blogs/ai-tts/s22-fastspeech-detail.png?w=380)

**Duration Predictor：** 学習時は自己回帰モデルのメルと実際のメルを対応づけ、各音素の長さを学びます。推論時は**自己回帰を使わず**直接予測するため高速です。

**Length Regulator：** 音素ごとのフレーム数を予測し、その表現を必要な回数だけ繰り返します。パラメータを調整することで**発話速度を制御**できます。

### FastSpeech 2（Microsoft、2020）

![FastSpeech 2 の構成](/blogs/ai-tts/s23-fastspeech2.png?w=520)

Duration Predictor に加え、**Energy Predictor と Pitch Predictor** を導入します。1 次元の制御信号を中間表現へ与え、韻律、エネルギー、音高を調整できます。

![FastSpeech 2s：波形を直接出力](/blogs/ai-tts/s23-fastspeech2s.png?w=300)

**FastSpeech 2s** はさらに踏み込み、メルから直接の波形生成へ進み、音響モデルとボコーダーを統合します。


## VITS：エンドツーエンドの突破口

### VITS（KAIST & Kakao、2021）

**Variational Inference with adversarial learning for end-to-end Text-to-Speech（敵対的学習を用いた変分推論によるエンドツーエンド音声合成）**

この発表の中心となるモデルです。**VAE・Flow・GAN** という 3 つの強力な生成モデルの考え方を組み合わせています。

![VITS の学習・推論の構成](/blogs/ai-tts/s24-vits-arch.png?w=720)

設計上の 3 つの原則：

1. **VAE** に基づく声の変換と、**Flow** に基づく音声合成を組み合わせる。VAE は文全体の韻律、Flow は音声の細かな特徴を扱い、多タスク学習でパラメータと利点を共有する。

2. メルではなく**音声を直接合成**する。音響モデルとボコーダーを別々に学習すると生じる不一致を、エンドツーエンドで解消する。

3. 従来の TTS の GAN 学習はボコーダーだけだったが、VITS では**全体に適用**する。識別器が生成波形全体を評価する。

### 生成モデルのおさらい

VITS の構成に進む前に、基本的な生成モデルを整理します。

![GAN・VAE・Flow・Diffusion・AR の概要](/blogs/ai-tts/s25-gen-models.png?w=580)

- **GAN：** 生成器と識別器をミニマックスゲームで同時に学習し、両方を改善する。
- **VAE：** 教師なし学習で、入力をエンコーダーが圧縮し、デコーダーが復元する。
- **Flow：** 既知の分布から**可逆な**変換を重ねて実際の分布を作る。ヤコビアンの行列式と変数変換で、確率密度を直接推定する。
- **Diffusion Models：** 順方向ではデータへ段階的にガウスノイズを加え、逆方向では条件付き確率を学んで少しずつ復元する。

### 変分オートエンコーダー VAE

VAE は VITS の中心なので、もう少し詳しく見ます。

![通常のオートエンコーダー](/blogs/ai-tts/s26-ae.png?w=420)

**通常のオートエンコーダー：** X を低次元の Z にし、X′ へ復元する。X′ をできるだけ X に近づける。

![変分オートエンコーダー](/blogs/ai-tts/s26-vae.png?w=420)

違いは、Z が固定値ではなく**分布**であることです。通常はガウス分布の μ・σ で表します。Z をサンプリングすると、**元のデータセットにない** X′ を生成できるようになります。

![VAE の数式の導出](/blogs/ai-tts/s26-vae-math.png?w=500)

ニューラルネットワークで真の `p(Z|X)` を近似します。損失は 2 つの項に分かれます。

- **再構成誤差：** デコーダーの出力を元の X へ近づける。
- **KL ダイバージェンス：** 学習した Z の分布を、**標準正規分布**として定めた事前分布へ近づける。

前者は復元できるか、後者は潜在空間が適切かを制約します。

### VITS の構成

全体のデータフロー：

**事前エンコーダー：** 文字 → Transformer → μ・σ を持つ分布 → 対応行列 A → 潜在変数 Z。

**事後エンコーダー：** 線形スペクトログラム → エンコーダー → Flow の変換 → 潜在変数 Z。

**学習目標：** KL ダイバージェンスで 2 つの潜在分布を近づける。

**確率的な長さ予測器：** 対応行列 A を学ぶ独立したモジュール。

**デコーダー：** 潜在変数 Z から波形を生成する。

**識別器：** 波形が実際のものか、生成されたものかを判断する。

**推論：** 文字 → エンコーダー → Z の分布 → 確率的な長さ予測器 → Flow の逆変換 → Z → デコーダー → 波形。

### VITS の結果

![VITS・Tacotron 2・Glow-TTS の MOS 比較](/blogs/ai-tts/s28-vits-mos.png?w=480)

MOS は **4.43**。正解音声の 4.46 に迫り、人の録音に近い聴感です。

各損失の項：

- `L_recon`：生成したメルと正解のメルの L1 損失。再構成のための項。
- `L_kl`：線形スペクトルから得た z と、文字・対応行列から得た z の KL ダイバージェンス。
- `L_dur`：確率的な長さ予測器の損失。
- `L_adv(G)`：生成した内容を本物と判定させるための損失。
- `L_fm(G)`：識別器の中間層で、生成と実際の内容の特徴を近づける項。

複数の損失を同時に使い、各部分を適切な方向へ学習させます。


## So-VITS-SVC：「AI 孫燕姿」の技術基盤

**SoftVC + VITS** を組み合わせた名前が SoVITS です。

![SoftVC の内容エンコーダー：離散表現と連続表現](/blogs/ai-tts/s29-sovits-arch.png?w=720)

元のリポジトリは `github.com/innnky/so-vits-svc` で、後に作者が削除しました。コミュニティの継続版は `github.com/svc-develop-team/so-vits-svc` にあります。

**考え方：** エンコーダーに ASR の **HuBERT**（BERT に基づく自己教師あり音声表現）を加え、**内容だけを渡して声質は渡さない**ようにします。目標の歌手の声質を使って復号します。

たとえば投稿者が周杰倫を歌った録音を入力すると、HuBERT が内容を抽出し、VITS が孫燕姿の音響モデルで波形を復元します。その結果、彼女の声でその曲を歌ったような音声になります。

### 実例

デモのために自分でモデルを学習しました。

- **600 本以上、各 1〜10 秒**の音声。miHoYo の『原神』のキャラクター、**神里綾華**の素材です。
- **機材：** RTX A5000（24 GB）1 枚。
- **学習時間：** 約 48 時間。

![神里綾華の立ち絵](/blogs/ai-tts/ayaka.jpeg?w=360)

稲妻は幕府時代の日本に着想を得た国です。綾華は神里家の令嬢で、神社、祭り、文化に関する仕事を管理しています。

以下は**声優による元の録音**と**VITS の生成音声**の比較です。同じ文章を使っているので、耳で比べてみてください。

<div class="ab-list">

<div class="ab-item">
<p class="ab-text">こんばんは。夜風が心地よく、よい夜になりそうですね。</p>
<div class="ab-row"><span class="ab-label">原音</span><audio controls preload="none" src="/blogs/ai-tts/orig-1.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-1.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">いえいえ……お褒めにあずかるほどではありません。務めを果たしただけです。</p>
<div class="ab-row"><span class="ab-label">原音</span><audio controls preload="none" src="/blogs/ai-tts/orig-2.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-2.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">「雪の晴れ間に、銀に装われた枝が映える。」うーん……この美しい景色には、お茶が一壺あれば十分ですね。</p>
<div class="ab-row"><span class="ab-label">原音</span><audio controls preload="none" src="/blogs/ai-tts/orig-3.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-3.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">あ、あの……待ってください！ まだ……行かないで……</p>
<div class="ab-row"><span class="ab-label">原音</span><audio controls preload="none" src="/blogs/ai-tts/orig-4.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-4.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">夢だとわかっているなら、なぜ目覚めるのでしょう。でも、本当に会えることにはかないません。</p>
<div class="ab-row"><span class="ab-label">原音</span><audio controls preload="none" src="/blogs/ai-tts/orig-5.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-5.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">神里家の当主として、兄は普段から様々な場に出なければなりません。責任を分担するよう努めていますが、長年の疲れを和らげることはできません。</p>
<div class="ab-row"><span class="ab-label">原音</span><audio controls preload="none" src="/blogs/ai-tts/orig-6.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-6.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">「素直であること」は本当に難しいものです。神里家の令嬢であることを自分に言い聞かせ、多くの視線と期待の中で、完璧な姿を見せなければなりません。</p>
<div class="ab-row"><span class="ab-label">原音</span><audio controls preload="none" src="/blogs/ai-tts/orig-7.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-7.wav"></audio></div>
</div>

</div>

声質はかなり似ており、抑揚、息遣い、区切りも再現できています。600 本の音声と A5000 1 枚で 48 時間、2023 年 6 月のオープンソース技術はここまで到達していました。


## VALL-E と AudioLM：言語モデルのパラダイム

2022〜2023 年、NLP の考え方が音声合成へ入りました。**音声をトークン列として扱い、GPT のように次のトークンを予測**します。代表例を 2 つ紹介します。

### VALL-E（Microsoft、2023）

![VALL-E の概要](/blogs/ai-tts/s31-valle.jpeg?w=560)

- データは **60K 時間**の英語音声、**7000 人**の話者。
- **3 秒の音声だけ**で、ゼロショットの声質再現ができる。
- **音素 → メル → 波形**から、**音素 → 離散符号 → 波形**へ移る。

鍵となるのは **EnCodec の離散符号化**です。8 段の残差符号を使い、後の段は前の段の残差を表し、各段を合わせて最終表現を作ります。

![EnCodec の 8 段の残差量子化](/blogs/ai-tts/s33-valle-encodec.png?w=560)

学習と推論では、**自己回帰 AR** と**非自己回帰 NAR** の 2 つを使います。

![VALL-E の AR・NAR 構成](/blogs/ai-tts/s33-valle-ar-nar.png?w=440)

- 学習時：AR は **1 段目**、NAR は **2〜8 段目**を学ぶ。
- 推論時：AR で 1 段目を予測し、NAR で残りを一括予測する。

この分け方の理由：

- 1 段目の影響が最も大きく、AR で精密に予測する必要がある。文の長さも予測できる。
- 全部を AR で扱うと遅く、NAR の並列学習の方が速い。

論文は次のように説明しています。

 > RVQ を用いるため、最初の量子化器が復元に最も大きく寄与し、それ以降の影響は徐々に小さくなります。

### AudioLM（Google、2022）

![AudioLM の 3 段階の構成](/blogs/ai-tts/s34-audiolm-1.png?w=400)

NLP の**次の単語を予測する自己教師あり学習**を取り入れた、音響だけを扱うモデルです。

- 学習データは **英語の発話 60,000 時間とピアノ音楽 40,000 時間**。
- 意味と音響を担当する、2 つのトークン化モデルを使う。

**3 段階の学習：**

![AudioLM の学習フロー](/blogs/ai-tts/s34-audiolm-2.png?w=340)

1. 意味モデルを学び、過去の意味トークンから将来の意味トークンを予測する。
2. 意味と音響のトークンを組み合わせ、将来の音響トークンを予測する。
3. 予測した音響トークンを調整し、実際の結果へ近づける。

声やピアノの**続きを生成**できますが、生成した発話に**意味があるとは限りません**。「次の音はどう聞こえるか」を学び、「次に何を言うか」を学ぶわけではないからです。

### EnCodec（Meta、2022）

VALL-E が使う EnCodec も、2022 年の技術です。ニューラルネットワークによるリアルタイム・高忠実度の音声コーデックで、**単一のマルチスケール・スペクトログラム識別器**によって学習を簡単・高速にし、歪みを抑えます。

高品質な音声トークン化があるからこそ、VALL-E のような音声言語モデルが実用になります。音声の tokenizer がなければ、次の音声トークンの予測も成立しません。


## 応用

ここからは、当時の 2023 年に実現していた応用を見ます。

### 音声で対話するチャットボット

**LLM + VITS + Live2D / MMD / Unity / ホログラム / QQ チャットボット。** GPT 型のモデルが回答を作り、VITS が読み上げ、Live2D や MMD のモデルで姿を表示します。

| Live2D | MMD | Unity | ホログラム |
| --- | --- | --- | --- |
| ![Live2D](/blogs/ai-tts/s35-live2d.png?w=200) | ![MMD](/blogs/ai-tts/s35-mmd.png?w=200) | ![Unity](/blogs/ai-tts/s35-unity.png?w=200) | ![ホログラム](/blogs/ai-tts/s35-full.png?w=140) |

この構成で、すでにかなり良いデモが作れました。

### 商用の応用

**miHoYo の『未定事件簿』：** ある声優が経済犯罪を理由に契約解除となり、そのキャラクターの以後の音声をすべて AI で制作した事例です。発表では、中国の二次元ゲーム業界で人の声を AI で置き換えた最初の公開事例として紹介しています。

![『未定事件簿』の AI 音声](/blogs/ai-tts/s36-mihoyo.png?w=280)

**VTuber Neuro-sama：** Live2D の姿を持ち、AI 言語モデルで視聴者とリアルタイムに対話する配信者。ゲームや歌の配信も行い、2023 年 6 月の発表時点では Twitch のフォロワーが 34 万人いました。

![Neuro-sama](/blogs/ai-tts/s36-neuro.png?w=280)

**VOCALOID：** ヤマハの歌声合成ソフトで、音符と歌詞を入力して歌を作ります。**2022 年の VOCALOID 6 で AI エンジンが導入**され、ルールベースの音源からニューラルな音源への変化が進んでいます。

![VOCALOID 6 AI](/blogs/ai-tts/s36-vocaloid.jpeg?w=280)


## 議論と課題

技術の外側では、2 つの社会的な問題があります。

**AI 詐欺：** VALL-E のように 3 秒の素材で声を複製できると、電話詐欺の危険が高まります。子どもの声を AI で再現した実際の詐欺も発生しています。

![AI 詐欺に関する報道](/blogs/ai-tts/s37-fraud.png?w=520)

**SoVITS 作者によるリポジトリ削除：** 「AI 孫燕姿」のブームの最中、作者は `github.com/innnky/so-vits-svc` を削除しました。技術の利用規模に対して、倫理的な境界がまだ整っていないという考えです。コミュニティの fork は残りましたが、作者自身は離れました。

![元の SoVITS リポジトリの削除](/blogs/ai-tts/s37-delete.jpeg?w=480)


## おわりに

2017 年の Tacotron から 2023 年の VALL-E まで、3 世代のパラダイムを経てきました。

1. **Tacotron / Tacotron 2：** 音響モデルとボコーダーの 2 段階。自己回帰で遅いものの、エンドツーエンドへの道を開いた。
2. **FastSpeech / VITS：** 非自己回帰、制御可能、単一モデルのエンドツーエンド、全体への GAN 学習。
3. **VALL-E / AudioLM：** 音声をトークン化し、言語モデルの方法でゼロショットの声質複製を行う。

2023 年の「AI 孫燕姿」は、これらの積み重ねで生まれました。VITS が高品質な枠組みを提供し、SoftVC が内容と声質を分離し、オープンソースによって個人でも消費者向け GPU で声のモデルを学べるようになりました。

技術はここまで来ました。法律、倫理、著作権、アイデンティティをめぐる課題は、これから始まります。

ご覧いただきありがとうございました。
