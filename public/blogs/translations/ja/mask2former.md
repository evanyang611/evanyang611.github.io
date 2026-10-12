## 1 画像セグメンテーションの概要


### 1.1 コンピュータビジョン

Hugging Face はコンピュータビジョンを 16 のタスクに分類しています。とくに基本となるのが画像分類、物体検出、画像セグメンテーションです。ここではセグメンテーションに注目します。

![図](/blogs/mask2former/b5ea5fd4-25c2-4ab2-97d4-1cedb0317e4b.png?w=528)


[画像分類](https://huggingface.co/tasks/image-classification)

画像分類は、画像全体を 1 つ以上のカテゴリへ割り当てるタスクです。モデルは画像の所属するカテゴリのラベルを出力します。

![図](/blogs/mask2former/81230a66-df75-496f-b2bb-d32257865f15.png?w=384)

[物体検出](https://huggingface.co/tasks/object-detection)

物体検出は、画像中の対象を見つけて示すタスクです。出力には各物体のカテゴリと、その位置を表すバウンディングボックスが含まれます。



![図](/blogs/mask2former/92edc04c-747b-4ade-96ee-bcd221485c12.png?w=384)

[画像セグメンテーション](https://huggingface.co/tasks/image-segmentation)

画像セグメンテーションは画像を複数の領域に分け、各領域を特定のカテゴリに対応させるタスクです。


![図](/blogs/mask2former/42b8ae6a-7268-4f74-9178-9519d2ad8f94.png?w=384)



### 1.2 画像セグメンテーション

さらに、セマンティック、インスタンス、パノプティックの 3 種類に分けられます。

![図](/blogs/mask2former/e96cd9e5-c61c-4fb1-833f-cb15e8d69a3a.png?full=1)

| **セマンティックセグメンテーション** | **インスタンスセグメンテーション** | **パノプティックセグメンテーション** |
| --- | --- | --- |
| **定義：** 各ピクセルにカテゴリを割り当てるが、同じカテゴリの個々の物体は区別しない。 | **定義：** 各ピクセルを分類するとともに、同じカテゴリの個体も区別する。物体検出とセマンティック分割を組み合わせる。 | **定義：** 両者の利点を組み合わせ、各ピクセルを個別の物体インスタンスか、空・道路などの背景カテゴリへ一意に割り当てる。 |
| **特徴：**<br>• 各ピクセルにカテゴリラベルがある。<br>• 同じカテゴリのピクセルは同じラベルを持つ。<br>• 同じカテゴリの個体は区別しない。 | **特徴：**<br>• 各ピクセルにカテゴリラベルがある。<br>• 個体ごとに異なるラベルやマスクを持つ。<br>• カテゴリと個体の両方を識別する。 | **特徴：**<br>• 各ピクセルにカテゴリラベルがある。<br>• 個体ごとに異なるラベルやマスクを持つ。<br>• 人や車などの thing と、空や道路などの stuff を同時に扱う。 |
| **用途：**<br>• 自動運転での道路・車線の検出。<br>• 医用画像での臓器・病変の分割。 | **用途：**<br>• 自動運転での歩行者・車両の検出。<br>• ロボットによる物体の把持・操作。 | **用途：**<br>• 自動運転などの高度な場面理解。<br>• 動画解析やロボットのナビゲーション。 |
| **例：** 複数の人がいても、すべての人のピクセルに「人」と付け、誰かは区別しない。 | **例：** 人のピクセルを認識し、さらに一人ずつ独立したマスクを作る。 | **例：** 一人ずつ区別したうえで、道路や建物などの背景領域にもラベルを付ける。 |


### 1.3 代表的なモデル

| モデル | 開発元 | 年 | 概要 |
| --- | --- | --- | --- |
| FCN | UC Berkeley | 2015 | CNN を全面的に画像分割へ適用した最初のモデル。全結合層を畳み込み層へ置き換え、任意の大きさの入力に対応する。 |
| U-Net | ドイツ・フライブルク大学 | 2015 | もともと生物医学画像の分割用だが、様々な分割タスクで優れた性能を示す。 |
| DeepLab 系列 | Google | 2016 | Atrous Convolution と ASPP により、複数スケールの文脈を捉える。DeepLabv3+ ではエンコーダー・デコーダー構成も採用する。 |
| Mask R-CNN | Meta | 2017 | 物体検出とインスタンス分割を同時に行う。Faster R-CNN に、検出した物体のマスクを予測する分岐を追加する。 |
| SOLO 系列 | アデレード大学 / ByteDance | 2019 | インスタンス分割を位置分類として捉え直し、処理を簡潔にして複数のベンチマークで高い性能を達成する。 |
| MaskFormer 系列 | Meta | 2021 | Transformer と動的なマスク予測による、統一的で効率的な分割手法。 |


### 1.4 代表的な学習データセット

| データセット | 概要 | 規模 |
| --- | --- | --- |
| COCO | 物体検出、分割、キーポイント、画像キャプションの大規模データセット。328K 枚の画像で構成される。 | 約33万枚 / 約20万枚に注釈 / 80カテゴリ / 150万以上のインスタンス |
| ADE20K | 20K 枚以上の場面中心の画像に、物体と物体の部分をピクセル単位で詳しく注釈する。空・道路・草などの背景や、人・車・ベッドなどを含む 150 カテゴリがある。 | 25,000枚 / 150の意味カテゴリ |
| Cityscapes | 都市の街路の意味理解を目的とするデータベース。平面、人、車両、建築、物体、自然、空、void の8群に属する30クラスについて、意味・個体・密なピクセル注釈を提供する。精密な注釈は約5,000枚、粗い注釈は約20,000枚。 | 精密注釈5,000枚 / 粗い注釈20,000枚 / 30クラス / ドイツで車載カメラにより収集 |


### 1.5 事前学習データセットによる結果の違い

結果の違いは主に次の要素で決まります。

- データセットの品質と量。
- 内容と対象の利用場面がどれだけ一致しているか。
以下は Mask2Former を使った比較です。

| 元画像 | COCO（パノプティック） | ADE20K（セマンティック） | Cityscapes（セマンティック） | Mapillary Vistas（セマンティック） |
| --- | --- | --- | --- | --- |
| | 分割の細かさが不足 | 路面の細部が不足 | 路面の細部が不足 | 車線や白い枠などの細部まで認識 |
| ![](/blogs/mask2former/b5dbd972-1d48-4a84-943e-e74058bc8648.png?w=280) | ![](/blogs/mask2former/074f3a0f-779e-4921-ab9c-50c5bb25124a.png?w=280) | ![](/blogs/mask2former/b4b7b11f-b04c-444e-b97c-2571fd74ec4f.png?w=280) | ![](/blogs/mask2former/d2945318-420d-4c40-b5b5-04f08d3b46a9.png?w=280) | ![](/blogs/mask2former/2b0d1e29-9171-4f9d-8781-2ad6e57829ef.png?w=280) |
| ![](/blogs/mask2former/3207a5a8-d0ec-482f-a9a6-b673b13b3c67.png?w=280) | ![](/blogs/mask2former/12b182b3-9f5a-41a9-b5a3-88777d62015d.png?w=280) | ![](/blogs/mask2former/7d08f244-2d8c-4978-a881-ad60df67cce3.png?w=280) | ![](/blogs/mask2former/54348bc3-cc4e-467d-a23d-997a73768d84.png?w=280) | ![](/blogs/mask2former/e6925d2d-3ff7-4fce-bdec-f6d05ea74f63.png?w=280) |
| ![](/blogs/mask2former/62bbf8fb-46b1-45c9-b414-9c42939ed0ac.png?w=280) | ![](/blogs/mask2former/9efafff7-8c3b-42a6-a6ed-3a0e5f1ae6b2.png?w=280) | ![](/blogs/mask2former/4e39063a-68cc-42a2-be4b-9e758bf408f7.png?w=280) | ![](/blogs/mask2former/99f0f58c-d037-4368-9bf6-78d16745c8c8.png?w=280) | ![](/blogs/mask2former/67c2deb2-8f4c-4540-9e0e-63facdd08d5b.png?w=280) |
| ![](/blogs/mask2former/041efdfc-24d7-4e5d-85f7-0f5c08bf5f97.png?w=280) | ![](/blogs/mask2former/2011b4ce-816d-4451-a956-4fd9555ff177.png?w=280) | ![](/blogs/mask2former/99ac9bc6-e1be-41c6-a5b3-8c446b186d9f.png?w=280) | ![](/blogs/mask2former/2949b2ed-e593-4734-9b3b-49f3ce311677.png?w=280) | ![](/blogs/mask2former/f3a69799-d936-470a-b101-536e5d835770.png?w=280) |



## 2 Mask2Former 系列の論文


### 2.1 導入

R-CNN や YOLO などの従来の物体検出では、先に候補の枠を作ったり画像を大まかな領域に区切ったりします。一方、画像分割は一般に各ピクセルを分類する問題として定義されていました。

| R-CNN の領域提案 | YOLO のグリッド | FCN | DeepLab |
| --- | --- | --- | --- |
| ![](/blogs/mask2former/0d3d02ba-b2bf-4fce-a142-7d8d3886cfc9.png?w=220) | ![](/blogs/mask2former/c63c0abd-9a42-471d-9fa3-c40dacefa99a.png?w=220) | ![](/blogs/mask2former/a8d426f1-7334-4d56-958b-544e6487c590.png?w=220) | ![](/blogs/mask2former/f776b79c-22a1-4635-a036-9ebb935c8764.png?w=220) |
| 領域提案、特徴抽出、カテゴリ分類、ボックス回帰 | 画像の分割、ボックス予測、カテゴリ予測 | | |


### 2.2 DETR（2020）

>

主要なアイデア：

- object query によって検出ボックスを直接出力し、候補ボックスの用意を不要にした。
![図](/blogs/mask2former/1b805dee-ef06-4a3c-9924-6b636039c3b2.png?full=1)

>

モデルの流れ

1. ResNet50 や ResNet101 の CNN で特徴を抽出し、空間を小さく、チャネルを増やす。形状は (2048, W/32, H/32)。
1. 1×1 の畳み込みでチャネルを減らし、d（256）×HW の系列へ変形する。
1. x・y 座標から、Transformer と同様の三角関数で位置埋め込みを作る。
1. 画像特徴と位置埋め込みをエンコーダーへ入力する。
1. 物体数より十分多い N 個の学習可能な object query を作る。100 個を torch.rand(100, 256) で初期化する。
1. query を標準のマスクなし・非自己回帰 Transformer デコーダーへ入れ、N 個の出力を得る。
1. query 間の自己注意が情報交換を促し、重複を減らす。
1. 一方の FFN が空クラスを含むカテゴリを予測し、もう一方がボックスの中心、幅、高さを予測する。
1. ハンガリアン法で順不同の N 個の予測と n 個の正解を対応づけ、全体の誤差を最小化する。余った予測は空クラスにする。
1. 対応関係に基づいて損失を計算する：
  1. Loss = 分類誤差 + ボックス誤差。
![図](/blogs/mask2former/941f38b9-8eba-43f5-9673-a62063561dcf.png?w=288)

  1. ボックス誤差 = 中心位置の距離 + ボックスの IoU。
![図](/blogs/mask2former/02b85bf5-4995-4af0-aba8-cd407d204f3a.png?w=240)


弱点：学習・推論が遅い。物体の認識は良いが、Transformer が全体の特徴を重視するため、小さい物体は苦手。


学習が進むと、object query のボックスは少しずつ正解へ近づきます。

ハンガリアン法による対応づけがあるため、特定の物体を担当する query は学習中に変わることがあります。

[video] citadelattachment-1805501192596934668.mp4
[video] citadelattachment-1805501194878935072.mp4
Transformer エンコーダーの注意の可視化

各点は、自分に対応する物体全体を重視します。

![図](/blogs/mask2former/ed17bb95-d7cf-4456-b808-b392571bc745.png?full=1)

Transformer デコーダーの注意の可視化

各ボックスは、物体の境界を重視します。

![図](/blogs/mask2former/f4dc4cc3-bb8b-43c2-a27f-b4e7cbb98e18.png?w=336)

Object Query の可視化。緑は小さい枠、赤は横長の大きい枠、青は縦長の大きい枠です。各 query には注目する位置の傾向があり、中心の大きな物体にも注目します。

100 個の query は、注目する場所の違う 100 人のようなものです。

![図](/blogs/mask2former/52a5bb38-c852-4a4d-94f3-40f77835a181.png?w=864)


>

論文：[https://arxiv.org/abs/2005.12872](https://arxiv.org/abs/2005.12872)

参考資料：

- [知乎：Transformer による物体検出 DETR](https://zhuanlan.zhihu.com/p/387102036)
- [Bilibili：DETR 論文の解説 [2005.12872]](https://www.bilibili.com/video/BV1T64y1D7NY/)
- [Bilibili：DETR 論文の詳読](https://www.bilibili.com/video/BV1GB4y1X72R)
- [知乎：DETR の object query と正解の対応を可視化する](https://zhuanlan.zhihu.com/p/592381828)



### 2.3 MaskFormer（2021）

>

主要なアイデア：

- 各ピクセルのカテゴリを予測する代わりに、カテゴリに対応するマスクを生成する。
![図](/blogs/mask2former/f1556fb5-18f4-48de-9904-85c199b70ef7.png?full=1)


![図](/blogs/mask2former/bcf5355b-20ac-4620-8a9a-629f29032846.png?w=432)

>

モデルの流れ

1. ResNet50、ResNet101、Swin Transformer などで特徴を抽出し、解像度を下げてチャネルを増やす。
1. FPN を使う pixel decoder で段階的に拡大し、元の H・W に戻して 256 次元のピクセル埋め込みにする。
1. DETR と同じく、予想される物体数より十分多い N 個の学習可能な query を作る。
1. query を Transformer デコーダーへ入力する。多頭注意の K・V には画像特徴を用い、N 個の出力を得る。
1. MLP と softmax で N 個のカテゴリ予測を作る。
1. 別の MLP で N 個の 256 次元マスク埋め込みを作る。
1. マスク埋め込みとピクセル埋め込みの内積に sigmoid を適用し、0〜1 の N 個のマスクを生成する。
1. マスクとカテゴリ予測を組み合わせ、K カテゴリそれぞれの分類マスクを得る。
1. セマンティック分割ではカテゴリが固定されており、ピクセルごとの損失を計算できるため二部グラフの対応づけは不要。ただし論文では、対応づけを使うと良くなるという記述もある。
  1. Loss = 分類損失 + マスク損失（DETR と同様）。
1. インスタンス分割などでは二部グラフの対応づけが必要。MaskFormer のインスタンス・パノプティック分割はセマンティックほど良くなく、Mask2Former でもその点を指摘している。

弱点：学習・推論が遅く、GPU メモリを多く使う。インスタンス・パノプティック分割の性能がセマンティック分割ほど良くない。

セマンティック分割とインスタンス分割の例から、異なるタスクでの性能が示されています。

![図](/blogs/mask2former/376b4026-e4c0-4829-8751-58bdc837949c.png?w=576)

>

論文：[https://arxiv.org/abs/2107.06278](https://arxiv.org/abs/2107.06278)

参考資料：

- [Bilibili：Per-Pixel Classification is Not All You Need for Semantic Segmentation [2107.06278]](https://www.bilibili.com/video/BV17f4y1A7XR/)



### 2.4 Mask2Former（2021）

>

主要なアイデア：

- Transformer デコーダーに masked attention を加える。
- デコーダー内で特徴ピラミッドを使う。
![図](/blogs/mask2former/afb03827-be46-4e5c-a61f-10e31183799b.png?w=384)

>

モデルの流れ

1. 全画像の交差注意は収束が遅く、局所の物体に注目するまで多くの学習時間を必要とする。そこで masked attention を加え、標準の残差付き交差注意を前景領域へ限定する。
  1. 元の注意：
![図](/blogs/mask2former/8b985dab-1b07-4612-bf1c-6c4518a4b2db.png?w=192)

  1. 改良後：
![図](/blogs/mask2former/a9f081ad-92a1-4eb0-871d-16686c7e9956.png?w=288)

  1. ここで：
![図](/blogs/mask2former/60226e96-f338-4f68-96dd-39e1cf57c251.png?w=240)

M_{l-1}(x,y) は前のデコーダー層のマスク予測です。

1. デコーダーには 3 層のブロックが L 個あり、各層の K・V は pixel decoder の異なるスケールの画像特徴を使う。
1. masked attention の後に self attention を行う。
1. 損失は全画像ではなく、ランダムに選んだ点で評価する。

評価結果

パノプティックセグメンテーション

![図](/blogs/mask2former/092f6ee7-157e-418f-887f-6a6b99c2133e.png?full=1)

インスタンスセグメンテーション

![図](/blogs/mask2former/9bfcce90-be11-45e9-acce-640d96bcf992.png?full=1)

セマンティックセグメンテーション

![図](/blogs/mask2former/bc116231-b2ef-4cdd-8956-c3c3c611a734.png?w=288)

同じ 4 個の query は、画像が変わっても比較的一定の位置に注目します。実質的に領域提案の役割を果たしています。

![図](/blogs/mask2former/1f522e7b-29e5-47af-8b4b-36d02c9fab41.png?w=384)

>

論文：[https://arxiv.org/abs/2112.01527](https://arxiv.org/abs/2112.01527)

参考資料：

- [Bilibili：Masked-attention Mask Transformer for Universal Image Segmentation [2112.01527]](https://www.bilibili.com/video/BV1ob4y1B7hp/)
