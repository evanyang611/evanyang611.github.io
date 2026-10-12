## Introduction

This talk was given in June 2023. At the time, “AI Stefanie Sun” covers were everywhere: Vitas's Opera 2, Jay Chou's Hair Like Snow, and JJ Lin's All the Way North, sung in Sun's voice. They sounded almost indistinguishable from the real thing.

![AI Stefanie Sun cover videos](/blogs/ai-tts/s3-arknights.png?w=680)

Stefanie Sun later responded in a personal blog post titled My AI. She said that the wave of AI covers had surprised her too, with a mixture of acceptance and bemusement.

![Stefanie Sun's statement, My AI](/blogs/ai-tts/s3-sunyanzi.jpeg?w=320)

The technical foundation was the open-source project **So-VITS-SVC**, or SoftVC + VITS Singing Voice Conversion. VITS itself came from a 2021 ICML paper on end-to-end speech synthesis: Kim, J., Kong, J., Son, J., Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech. To understand why AI Stefanie Sun suddenly became possible, we need to trace the development of speech synthesis.

### The context

ChatGPT had already captured global attention. AI-related video uploads on Bilibili grew exponentially in early 2023.

![Bilibili AI video uploads: speech, images, and conversation](/blogs/ai-tts/s4-bilibili-all.png?w=720)

The chart reveals the turning points across three timelines:

- **NovelAI**, around October 2022: AI image generation, shown in orange, took off first.
- **ChatGPT's launch**, November 30, 2022: conversational AI, in green, surged.
- **Mainstream Chinese media attention to ChatGPT**, February 2023: the green bars peaked.
- **GPT-4 and popular LoRA training tutorials**, from March 2023: all three categories grew sharply.

Looking at **AI speech** alone:

![AI speech video uploads on Bilibili](/blogs/ai-tts/s4-bilibili-voice.png?w=720)

Uploads rose from nearly zero in May 2022 to more than 400 per week in April 2023, just before this talk.


## Three Directions in Intelligent Speech

First, divide the field into three areas:

![ASR, TTS, and VC](/blogs/ai-tts/s5-asr-tts-vc.png?w=520)

- **Speech → text:** Automatic Speech Recognition, or ASR.
- **Text → speech:** Text-to-Speech Synthesis, or TTS.
- **Speech → speech:** Speech separation and Voice Conversion, or VC.

AI Stefanie Sun belongs to the third area: changing a voice's timbre while preserving the words and melody. Understanding VC requires understanding TTS, because VC developed from TTS architectures.


## Basics of Speech Signals

### What is sound?

Before synthesizing speech, we need to understand the signal itself.

![The three properties of sound: loudness, pitch, and timbre](/blogs/ai-tts/s6-three-props.png?w=420)

Sound waves travel through the air and are captured by a microphone. An **analog-to-digital converter (ADC)** samples and quantizes them into a discrete digital signal: a **waveform file**.

![Sound waves and analog-to-digital conversion](/blogs/ai-tts/s6-adc.jpeg?w=180)

Sound has three basic properties: **loudness, pitch, and timbre**.

| Term | Meaning |
| --- | --- |
| Sound wave | Travels through air and is captured, sampled, and quantized into a discrete digital signal. |
| Energy | Frame energy in the time domain, related to squared amplitude. |
| Short-time energy | How signal strength varies over time. |
| Sound intensity | Average sound energy passing through unit area perpendicular to propagation per unit time; measured in decibels (dB). |
| Loudness | Subjective perceived strength, related to intensity and frequency; measured in phons. |
| Fundamental frequency | The inverse of the fundamental period, corresponding to vocal-fold vibration and pitch. About 100–250 Hz for adult men and 150–350 Hz for women. |
| Harmonics | Integer multiples of the fundamental frequency, produced through resonance and associated with timbre. |

Several less intuitive points matter:

**Human hearing covers roughly 20–20000 Hz**, but pitch perception follows a **logarithmic relationship**. The interval from 100 to 200 Hz feels like that from 200 to 400 Hz. This is important when we get to **mel spectrograms**.

**What determines timbre?** Harmonics. The fundamental determines pitch, while the positions and spacing of its harmonic components help identify whose voice it is. So-VITS-SVC changes timbre by changing these harmonic structures.

### Digital audio parameters

Three parameters are central: **bit depth, sample rate, and channel count**.

![Common formats: CD, MP3, and DVD](/blogs/ai-tts/s7-cd-formats.png?w=680)

**Bit depth:** the number of bits per sample.
- 16-bit: about 96 dB dynamic range, suitable for ordinary popular music.
- 24-bit: about 144 dB, used for film scores, symphonies, and other wide-dynamic-range audio.

**Sample rate:** samples captured per second.
- 8 kHz: telephony.
- 22.050 kHz: radio broadcasting.
- 44.1 kHz: audio CDs and MP3.
- 48 kHz: miniDV, digital television, DVD, film, and professional audio.
- 96 / 192 kHz: DVD-Audio and Blu-ray audio.

**Channels:** the number of captured signal streams: mono, stereo, 2.1, 5.1, 7.1, and so on.

For example, read an audio file with librosa:

![An audio waveform read with librosa](/blogs/ai-tts/s8-waveform.png?w=560)

- **16-bit depth:** `2^15 = 32768`; values range from `[-32768, 32767]`, then librosa normalizes them.
- **48000 Hz:** 48000 samples per second.
- **One channel:** a single sequence.

**Storage = bit depth × sample rate × channels × duration.**

A five-second 48 kHz mono recording is read as an array with shape `(239104,)`.


## Speech Feature Extraction

Feeding raw waveforms directly into a neural network is difficult because they have low information density and are **non-stationary**. Industry systems therefore commonly extract features first, transforming waveforms into structured frequency-domain representations.

### Short-time stationarity

Speech is non-stationary overall, but vocal folds vibrate **regularly** during voiced sounds, making the fundamental frequency relatively stable over short periods. Segments of about 10–50 ms can therefore be treated as **approximately stationary**.

This assumption underpins the processing that follows.

![Phonemes, graphemes, phones, and syllables](/blogs/ai-tts/s9-phoneme.png?w=560)

Some terminology:

| Term | Meaning |
| --- | --- |
| Phoneme | The smallest sound unit that distinguishes meaning. Different speakers or environments can produce different realizations. |
| Grapheme | The written representation corresponding to a phoneme. |
| Phone | A concrete realization of a phoneme. |
| Syllable | A unit made up of phonemes; a Chinese character corresponds to a syllable in this example. |

A phoneme is a mental equivalence class rather than a single actual sound. It can have several pronunciations that speakers regard as equivalent, sometimes without noticing their acoustic differences. These variants are called **allophones**.

The **International Phonetic Alphabet (IPA)** provides a cross-language phonetic notation:

![The International Phonetic Alphabet chart](/blogs/ai-tts/s10-ipa-chart.jpeg?w=320)

TTS generally converts text into phonetic notation such as pinyin, zhuyin, or IPA, then synthesizes an acoustic signal from it.

### Pre-emphasis, framing, and windowing

Three preprocessing steps connect waveforms to spectra:

**Pre-emphasis:** Radiation at the lips reduces high-frequency energy. A first-order difference compensates for this:

$$x'[n] = x[n] - a \times x[n-1]$$

![Comparison of pre-emphasis effects](/blogs/ai-tts/s11-preemphasis.png?w=280)

**Framing:** Frames are typically 20 or 50 ms long. Fundamental frequency can change between frames, for example between syllables or from an initial consonant to a vowel. **Overlapping frames**, often with a frame-length-to-hop ratio of 1:4 or 1:5, keep acoustic features smooth.

![Framing a speech signal](/blogs/ai-tts/s11-framing.png?w=280)

With 50 ms frames, a 1:4 ratio, and a 48000 Hz sample rate, each frame contains 2400 points and one second contains 81 frames.

**Windowing:** Framing applies a rectangular window, whose boundaries create side lobes and **spectral leakage**. Smooth windows reduce it; Hamming, Hann, and Blackman windows are common choices.

![Common window functions](/blogs/ai-tts/s11-window.png?w=520)

### Fourier and short-time Fourier transforms

The **Fourier transform (FT)** represents a periodic function as a combination of sines and cosines. Euler's formula expresses this in complex exponentials, connecting real and complex domains.

The **short-time Fourier transform (STFT)** splits a signal into overlapping frames and transforms each, obtaining frequency magnitudes and phases at each time.

![STFT illustration](/blogs/ai-tts/s12-stft.png?w=440)

![The STFT formula](/blogs/ai-tts/s12-formula.png?w=280)

For the 239104-point recording, with 2048-point frames and a hop of one quarter of the frame length, there are `239104/(2048/4)+1 = 468` frames.

![The STFT result matrix](/blogs/ai-tts/s13-stft-result.png?w=340)

The result has shape `(1025, 468)`. Each entry is a complex number representing amplitude and phase. Why 1025 frequency bins? The **Nyquist sampling theorem** requires a sample rate greater than twice the highest signal frequency to reconstruct the original without distortion. The highest bin count is therefore `2048/2+1 = 1025`.

### Spectrograms and mel spectrograms

A **spectrogram** visualizes an audio signal across time and frequency: time on the horizontal axis, frequency on the vertical axis, and color intensity for energy. This is what sound looks like in a typical visualization.

![A spectrogram example](/blogs/ai-tts/s14-spectrogram.png?w=600)

![Spectrogram data](/blogs/ai-tts/s14-spec-vis.png?w=400)

A **mel spectrogram** reflects the fact that hearing responds differently at different frequencies:

1. Below 1 kHz, perception is approximately **linear** in frequency.
2. Above 1 kHz, it is approximately **logarithmic**.

![The mel scale](/blogs/ai-tts/s15-mel-curve.png?w=300)

Our ears are more sensitive to differences at low frequencies. A linear spectrum gives equal attention to differences at high frequencies that listeners may not hear.

![Conversion to the mel scale](/blogs/ai-tts/s15-mel-scale.png?w=200)

The **mel scale** maps linear frequency to perceived frequency, with 1 kHz corresponding to 1000 mels. Mel spectrograms are denser at low frequencies and sparser at high ones, better matching human discrimination.

![A mel spectrogram example](/blogs/ai-tts/s15-mel-spec.png?w=420)

The TTS models discussed next use **mel spectrograms** instead of raw waveforms as an intermediate representation: compact, information-rich, and aligned with perceived sound.


## Overview of TTS Models

Modern industrial neural speech-synthesis systems commonly contain three parts:

![The TTS pipeline: text front end, acoustic model, vocoder](/blogs/ai-tts/s16-tts-pipeline.png?w=720)

1. **Text front end:** Convert text into phonemes, prosodic boundaries, and related features.
2. **Acoustic model:** Convert text features into acoustic features, usually mel spectrograms.
3. **Vocoder:** Reconstruct a waveform from the acoustic features.

![Details of the TTS modules](/blogs/ai-tts/s16-tts-detail.png?w=720)

A Survey on Neural Speech Synthesis (Tan et al., 2021) organizes the field into acoustic models, vocoders, and end-to-end approaches:

![Neural TTS survey: model family tree 1](/blogs/ai-tts/s17-tts-family1.png?w=600)

![Neural TTS survey: model family tree 2](/blogs/ai-tts/s17-tts-family2.png?w=400)

We will follow the key models chronologically, from Tacotron in 2017 to VALL-E in 2023.

### Evaluation metrics

Before discussing models, how do we assess synthesized speech?

**Subjective evaluation:** people rate the speech. Common measures include:
- **MOS:** Mean Opinion Score.
- **CMOS:** CrowdMOS, crowdsourced mean opinion scoring.
- **ABX testing.**

**Objective evaluation:** automatic metrics such as **MCD**, Mel Cepstral Distortion. Objective assessment is less developed in speech synthesis for a simple reason: **the final judge is the human ear**.

The International Telecommunication Union standardizes MOS evaluation in ITU-T P.800; **Absolute Category Rating (ACR)** is widely used:

![ACR rating criteria in ITU-T P.800](/blogs/ai-tts/s18-mos-table.png?w=680)


## Vocoders

There are several common ways to turn mel spectrograms back into waveforms.

### The Griffin–Lim algorithm

**No training required:** estimate phase from relationships between frames and iteratively reconstruct speech using the inverse STFT. It is simple and fast, but sound quality is limited. Tacotron 1 uses it.

### WaveNet

Google proposed this neural vocoder in 2016. It can be trained using mel spectrograms generated by a model.

![Dilated causal convolutions in WaveNet](/blogs/ai-tts/s19-wavenet.png?w=520)

WaveNet's key success is **dilated causal convolution**, which expands a CNN's receptive field to model long dependencies. Speech correlations can span thousands of samples; ordinary CNNs cannot cover enough. Exponentially increasing dilation covers long-range dependencies while keeping parameter counts manageable.

WaveNet became a default vocoder in many later TTS systems, including Tacotron 2.


## The Tacotron Family

### Tacotron (Google, March 2017)

An early fully end-to-end neural TTS system with an encoder–decoder architecture.

![Tacotron architecture](/blogs/ai-tts/s20-tacotron.png?w=680)

Its distinctive component is **CBHG: a 1-D convolution bank, highway network, and bidirectional GRU**.

![The CBHG module](/blogs/ai-tts/s20-cbhg.png?w=260)

**Pipeline:**
- Text → encoder → hidden representation.
- Hidden representation → decoder → mel spectrogram.
- Mel spectrogram → Griffin–Lim → waveform.

**Encoder:** Pre-net + CBHG.
- Pre-net: fully connected layers and dropout.
- CBHG: convolutions, pooling, residual connections, and a bidirectional GRU; sequence in, sequence out.

**Decoder:** a two-layer GRU divided into an attention decoder and an output decoder.
- The attention decoder produces a query vector for attention.
- The output decoder takes the query and context vectors.
- Multiple frames are predicted per step to accelerate convergence.
- The mel spectrogram is converted to a linear spectrogram, then Griffin–Lim produces the final waveform.

### Tacotron 2 (Google, December 2017)

![Tacotron 2 architecture](/blogs/ai-tts/s21-tacotron2.png?w=420)

Several key changes from Tacotron:

- Replace CBHG with ordinary **LSTMs and convolutions**.
- Predict one frame per decoder step.
- Add a **post-net** to refine the mel spectrogram.
- Use a stronger vocoder: **WaveNet**.

![Tacotron 2 details](/blogs/ai-tts/s21-tacotron2-arch.png?w=560)

**Encoder:** character/phoneme encoding → three convolutional layers → bidirectional LSTM, maintaining dimensionality.

**Decoder:** mel spectrogram → pre-net → LSTM.
- One path attends to the text output to establish alignment.
- Another extracts features from the mel spectrogram itself through convolution.
- Merge the two paths.
- One branch predicts whether to stop.
- Another passes through five post-net convolution layers to obtain the final mel spectrogram.

Tacotron 2 was the de facto TTS benchmark from 2017 to 2019.


## The FastSpeech Family

### FastSpeech (Microsoft, 2019)

Tacotron 2 has several clear limitations:

- **Slow synthesis:** autoregressive models generate frame by frame.
- **Limited robustness:** errors propagate through the sequence.
- **Limited control:** speech rate and prosody are difficult to adjust.

![FastSpeech architecture](/blogs/ai-tts/s22-fastspeech.png?w=600)

FastSpeech is **non-autoregressive**, producing the entire mel spectrogram in parallel. This requires knowing how many frames correspond to each phoneme, so it introduces two modules:

![FastSpeech duration predictor and length regulator](/blogs/ai-tts/s22-fastspeech-detail.png?w=380)

**Duration Predictor:** During training, an autoregressive model generates a mel spectrogram and aligns it to the real one, providing phoneme-duration targets. Inference predicts durations directly, **without autoregression**, for greater speed.

**Length Regulator:** Predict how many frames each phoneme needs and repeat its representation accordingly. Adjustable hyperparameters provide **control over speech rate**.

### FastSpeech 2 (Microsoft, 2020)

![FastSpeech 2 architecture](/blogs/ai-tts/s23-fastspeech2.png?w=520)

In addition to duration prediction, FastSpeech 2 adds **energy and pitch predictors**. These one-dimensional controllable signals enter the intermediate representation, making prosody, energy, and pitch adjustable.

![FastSpeech 2s: direct waveform output](/blogs/ai-tts/s23-fastspeech2s.png?w=300)

**FastSpeech 2s** goes further, moving from mel spectrograms to direct waveform generation and bringing the acoustic model and vocoder together.


## VITS: An End-to-End Breakthrough

### VITS (KAIST & Kakao, 2021)

**Variational Inference with adversarial learning for end-to-end Text-to-Speech**

The central model of this talk combines three powerful generative ideas: **VAE + Flow + GAN**.

![VITS training and inference architecture](/blogs/ai-tts/s24-vits-arch.png?w=720)

Three design principles:

1. VITS combines a **VAE-based voice system** with **Flow-based speech synthesis**. The VAE captures overall prosody, while Flow reconstructs fine audio details. They share parameters and strengths through multi-task training.

2. VITS **synthesizes audio directly**, rather than an intermediate mel spectrogram. This end-to-end approach avoids the mismatch that often arises when an acoustic model and vocoder are trained separately.

3. In conventional TTS, GAN training is applied only to the vocoder. In VITS it is **global**, influencing all modules as the discriminator scores the generated waveform as a whole.

### A quick review of generative models

Before examining VITS, a few foundational models:

![Overview of GAN, VAE, Flow, diffusion, and autoregression](/blogs/ai-tts/s25-gen-models.png?w=580)

- **GAN:** Train a generator and discriminator in a minimax game, improving both together.
- **VAE:** An unsupervised encoder compresses input into a representation, and a decoder reconstructs it.
- **Flow:** Transform a known distribution into the data distribution through **invertible** functions. Jacobian determinants and change-of-variable rules enable direct density estimation.
- **Diffusion models:** A forward process gradually adds Gaussian noise to real samples. A learned reverse process estimates conditional probabilities to recover the sample step by step.

### Variational autoencoders

The VAE is central to VITS and deserves a closer look.

![A standard autoencoder](/blogs/ai-tts/s26-ae.png?w=420)

A **standard autoencoder** maps X to a low-dimensional Z and decodes it to X′, aiming to make X′ as close as possible to X.

![A variational autoencoder](/blogs/ai-tts/s26-vae.png?w=420)

The key difference is that Z is a **distribution**, usually a Gaussian parameterized by μ and σ, rather than a fixed value. Sampling Z can generate X′ **not present in the original dataset**, giving the model generative capability.

![The mathematical derivation of a VAE](/blogs/ai-tts/s26-vae-math.png?w=500)

A neural network approximates the true `p(Z|X)`. The loss separates into two terms:

- **Reconstruction error:** make the decoded X as close to the original as possible.
- **KL divergence:** make the learned Z distribution close to its prior, defined as a **standard normal distribution**.

One term tests reconstruction; the other keeps the latent space well-behaved.

### VITS architecture

The full data flow:

**Prior encoder:** text → Transformer → distribution with μ and σ → alignment matrix A → latent Z.

**Posterior encoder:** linear spectrogram → encoder → Flow transformation → latent Z.

**Training objective:** bring the two latent distributions closer using KL divergence.

**Stochastic duration predictor:** a separate module that learns alignment matrix A.

**Decoder:** generate a waveform from latent Z.

**Discriminator:** a separate module judging whether waveforms are real or generated.

**Inference:** text → encoder → Z distribution → stochastic duration predictor → inverse Flow → Z → decoder → waveform.

### VITS results

![MOS comparison: VITS, Tacotron 2, and Glow-TTS](/blogs/ai-tts/s28-vits-mos.png?w=480)

VITS achieves a MOS of **4.43**, compared with 4.46 for ground truth, approaching the listening quality of real voice recordings.

Loss terms:

- `L_recon`: L1 loss between generated and real mel spectrograms, the reconstruction loss.
- `L_kl`: KL divergence between latent z from the linear spectrogram and latent z from text plus alignment.
- `L_dur`: the stochastic duration predictor's loss.
- `L_adv(G)`: the loss encouraging the discriminator to classify generated output as real.
- `L_fm(G)`: feature matching between real and generated samples in the discriminator's intermediate layers.

Joint training with these losses pushes every component in the right direction.


## So-VITS-SVC: The Foundation of AI Stefanie Sun

**SoftVC + VITS** gives SoVITS its name.

![The SoftVC content encoder: discrete versus soft](/blogs/ai-tts/s29-sovits-arch.png?w=720)

The original repository was `github.com/innnky/so-vits-svc`, later deleted by its author. The community-maintained version is `github.com/svc-develop-team/so-vits-svc`.

The core idea is to add an ASR component to the encoder—**HuBERT**, a BERT-based self-supervised speech representation. It passes **content, not timbre**, then decodes that content using the target singer's voice.

A dry vocal recording, such as a creator singing a Jay Chou song, goes into HuBERT to extract content. The VITS decoder reconstructs a waveform using Stefanie Sun's acoustic model, creating a rendition in her voice.

### Example

I trained a model for this demonstration:

- **More than 600 clips, each 1–10 seconds**, from the Genshin Impact character **Kamisato Ayaka**, a game by miHoYo.
- **Hardware:** one RTX A5000 with 24 GB VRAM.
- **Training time:** about 48 hours.

![Kamisato Ayaka character illustration](/blogs/ai-tts/ayaka.jpeg?w=360)

Ayaka is the daughter of the Kamisato family in Inazuma, inspired by shogunate-era Japan. She helps manage shrines, festivals, and cultural affairs.

Below, compare **original recordings by a human voice actor** with **VITS-generated speech**. Both use the same text; listen to the difference:

<div class="ab-list">

<div class="ab-item">
<p class="ab-text">Good evening. The night breeze feels lovely. It should be a beautiful night.</p>
<div class="ab-row"><span class="ab-label">Original</span><audio controls preload="none" src="/blogs/ai-tts/orig-1.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-1.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">No, no… you flatter me. I have only done my duty.</p>
<div class="ab-row"><span class="ab-label">Original</span><audio controls preload="none" src="/blogs/ai-tts/orig-2.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-2.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">“After the snow, silver adorns the branches.” Hmm… all this beautiful scenery needs is a pot of tea.</p>
<div class="ab-row"><span class="ab-label">Original</span><audio controls preload="none" src="/blogs/ai-tts/orig-3.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-3.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">Ah, ah… wait! Please… don't leave yet…</p>
<div class="ab-row"><span class="ab-label">Original</span><audio controls preload="none" src="/blogs/ai-tts/orig-4.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-4.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">If I know this is a dream, why wake? Yet no dream could equal meeting you in reality.</p>
<div class="ab-row"><span class="ab-label">Original</span><audio controls preload="none" src="/blogs/ai-tts/orig-5.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-5.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">As head of the Kamisato family, my brother must appear on many occasions. I try to share his responsibilities, but I cannot ease the exhaustion he has accumulated over the years.</p>
<div class="ab-row"><span class="ab-label">Original</span><audio controls preload="none" src="/blogs/ai-tts/orig-6.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-6.wav"></audio></div>
</div>

<div class="ab-item">
<p class="ab-text">Being candid is truly difficult. I must keep reminding myself that I am the daughter of the Kamisato family, presenting a flawless image under countless eyes and expectations.</p>
<div class="ab-row"><span class="ab-label">Original</span><audio controls preload="none" src="/blogs/ai-tts/orig-7.wav"></audio></div>
<div class="ab-row"><span class="ab-label">VITS</span><audio controls preload="none" src="/blogs/ai-tts/vits-7.wav"></audio></div>
</div>

</div>

The timbre is remarkably similar: intonation, breath, and phrasing are reproduced well. With 600 clips, one A5000, and 48 hours of training, the open-source stack could already reach this level in June 2023.


## VALL-E and AudioLM: The Language-Model Paradigm

In 2022–2023, ideas from NLP reshaped synthesis: **treat audio as a sequence of tokens and predict the next token, as in GPT**. Two representative works follow.

### VALL-E (Microsoft, 2023)

![Overview of VALL-E](/blogs/ai-tts/s31-valle.jpeg?w=560)

- Training data: **60K hours** of English speech from **7000** speakers.
- Zero-shot voice replication with **just three seconds** of reference audio.
- A shift from **phonemes → mel spectrogram → waveform** to **phonemes → discrete codes → waveform**.

The core is **EnCodec's discrete coding**. Audio uses eight residual-code layers; each subsequent layer represents the previous layer's residual, and the layers combine into the final representation.

![Eight-layer EnCodec residual quantization](/blogs/ai-tts/s33-valle-encodec.png?w=560)

Both training and inference use two models: an **autoregressive AR model** and a **non-autoregressive NAR model**.

![The VALL-E AR and NAR architecture](/blogs/ai-tts/s33-valle-ar-nar.png?w=440)

- Training: AR learns the **first** EnCodec layer, while NAR learns layers **2–8**.
- Inference: AR predicts the first layer, then NAR predicts layers 2–8 in parallel.

Why split the process this way?

- The first layer contributes most and needs accurate autoregressive prediction. AR can also predict sequence length.
- Fully autoregressive training is slow; parallel NAR training is much faster.

The paper explains:

> Because RVQ is employed, the first quantizer plays the most important role in reconstruction, and the impact from others gradually decreases.

### AudioLM (Google, 2022)

![AudioLM's three-stage architecture](/blogs/ai-tts/s34-audiolm-1.png?w=400)

A purely acoustic model following NLP's **self-supervised next-token prediction** approach.

- Data: **60,000 hours of English speech and 40,000 hours of piano music**.
- Two tokenization models: one for textual/semantic information, another for acoustic information.

**Three training stages:**

![The AudioLM stage flow](/blogs/ai-tts/s34-audiolm-2.png?w=340)

1. Learn the semantic model, predicting future semantic tokens from past ones.
2. Combine semantic and acoustic tokens to predict future acoustic tokens.
3. Refine predicted acoustic tokens to bring them closer to the real signal.

AudioLM can **continue speech and piano recordings**, but generated speech **may not carry meaning**. It learns what the next sound should resemble, not what the next words should say.

### EnCodec (Meta, 2022)

EnCodec, the codec used by VALL-E, was also introduced in 2022. It is a neural, real-time, high-fidelity audio codec. A **single multi-scale spectrogram discriminator** simplifies and accelerates training, reducing distorted spectra and improving sample quality.

High-quality audio tokenization is what makes audio language models such as VALL-E practical. Without it, predicting the next audio token would have no useful foundation.


## Applications

Now consider applications that had already emerged in 2023.

### Voice-interactive chatbots

**LLM + VITS + Live2D / MMD / Unity / holograms / QQ chatbots:** a GPT-style model produces replies, VITS speaks them, and Live2D or MMD provides the visual character.

| Live2D | MMD | Unity | Hologram |
| --- | --- | --- | --- |
| ![Live2D](/blogs/ai-tts/s35-live2d.png?w=200) | ![MMD](/blogs/ai-tts/s35-mmd.png?w=200) | ![Unity](/blogs/ai-tts/s35-unity.png?w=200) | ![Hologram](/blogs/ai-tts/s35-full.png?w=140) |

This stack could already produce impressive demos.

### Commercial applications

**miHoYo's Tears of Themis:** after a character's voice actor's contract was terminated over an economic crime, that character's subsequent lines were voiced entirely using AI. The talk describes this as the first public use of AI to replace human voice work in China's anime-style games industry.

![AI voice work in Tears of Themis](/blogs/ai-tts/s36-mihoyo.png?w=280)

**VTuber Neuro-sama:** a virtual streamer with a Live2D avatar and an AI language model responding to viewers in real time. Streams include AI gameplay and singing. She had 340,000 Twitch followers at the time of this June 2023 talk.

![Neuro-sama](/blogs/ai-tts/s36-neuro.png?w=280)

**VOCALOID:** Yamaha's singing-synthesis software creates vocal performances from notes and lyrics. **VOCALOID 6 introduced an AI engine in 2022**, reflecting the shift from rule-based sound sources to neural ones.

![VOCALOID 6 AI](/blogs/ai-tts/s36-vocaloid.jpeg?w=280)


## Controversies

Beyond the technology, two social issues stand out:

**AI scams:** VALL-E-level voice replication from a three-second sample poses a serious fraud risk. There have been real telephone scams using AI-generated copies of children's voices.

![Reports of AI-enabled fraud](/blogs/ai-tts/s37-fraud.png?w=520)

**The original SoVITS repository was deleted:** its author removed `github.com/innnky/so-vits-svc` at the height of the AI Stefanie Sun trend, saying the technology's ethical boundaries were not ready for such widespread use. Community forks remained, but the original author stepped away.

![Deletion of the original SoVITS repository](/blogs/ai-tts/s37-delete.jpeg?w=480)


## Closing

From Tacotron in 2017 to VALL-E in 2023, speech synthesis passed through three paradigms:

1. **Tacotron / Tacotron 2:** acoustic model plus vocoder; autoregressive and slow, but an important end-to-end breakthrough.
2. **FastSpeech / VITS:** non-autoregressive, controllable, unified end-to-end models, and global GAN training.
3. **VALL-E / AudioLM:** audio as tokens, language-model approaches, and zero-shot voice cloning.

The 2023 AI Stefanie Sun wave emerged from their combined progress: VITS provided a high-quality end-to-end framework, SoftVC separated content from timbre, and open source let individuals train useful voice models on consumer GPUs.

The technology has reached this point. The remaining questions—law, ethics, copyright, and identity—are only beginning.

Thank you for reading.
