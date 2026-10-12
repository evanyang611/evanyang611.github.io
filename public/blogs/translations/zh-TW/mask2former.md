## 1 圖像分割簡介


### 1.1 計算機視覺

Hugging Face 將計算機視覺分成16個task， 其中最基礎且核心的三個方向，也就是圖像分類、目標檢測和圖像分割。我們這次主要關注在圖像分割方向。

![image.png](/blogs/mask2former/b5ea5fd4-25c2-4ab2-97d4-1cedb0317e4b.png?w=528)


[圖像分類](https://huggingface.co/tasks/image-classification)

圖像分類是指將整個圖像分配到一個或多個類別中的任務。模型的輸出是一個或多個類別標籤，表示圖像所屬的類別。

![image.png](/blogs/mask2former/81230a66-df75-496f-b2bb-d32257865f15.png?w=384)

[目標檢測](https://huggingface.co/tasks/object-detection)

目標檢測是指在圖像中找到並標記出所有感興趣的物體。模型的輸出包括每個物體的類別標籤和邊界框（bounding box），表示物體的位置。



![image.png](/blogs/mask2former/92edc04c-747b-4ade-96ee-bcd221485c12.png?w=384)

[圖像分割](https://huggingface.co/tasks/image-segmentation)

圖像分割是指將圖像劃分為多個區域，每個區域對應一個特定的類別。


![image.png](/blogs/mask2former/42b8ae6a-7268-4f74-9178-9519d2ad8f94.png?w=384)



### 1.2 圖像分割

圖像分割具體細分也可以分成3種形式：語義分割、實例分割、全景分割。

![image.png](/blogs/mask2former/e96cd9e5-c61c-4fb1-833f-cb15e8d69a3a.png?full=1)

| **Semantic Segmentation**<br>語義分割 | **Instance Segmentation**<br>實例分割 | **Panoptic Segmentation**<br>全景分割 |
| --- | --- | --- |
| **定義**：語義分割的目標是將圖像中的每個像素分類為特定的類別。換句話說，它為圖像中的每個像素分配一個類別標籤，但不區分同一類別的不同實例。 | **定義**：實例分割的目標是不僅要將圖像中的每個像素分類為特定的類別，還要區分同一類別的不同實例。它結合了物體檢測和語義分割的任務。 | **定義**：全景分割的目標是結合語義分割和實例分割的優點，將圖像中的每個像素分類為特定的類別，同時區分同一類別的不同實例。全景分割需要對每個像素進行唯一標識，確保每個像素要麼屬於一個具體的物體實例，要麼屬於一個背景類（如天空、道路等）。 |
| **特點**：<br>• 每個像素都有一個類別標籤。<br>• 同一類別的所有像素被分配相同的標籤。<br>• 不區分同一類別的不同實例。 | **特點**：<br>• 每個像素都有一個類別標籤。<br>• 同一類別的不同實例會被分配不同的標籤或掩碼。<br>• 既要識別類別，又要區分同一類別的不同實例。 | **特點**：<br>• 每個像素都有一個類別標籤。<br>• 同一類別的不同實例會被分配不同的標籤或掩碼。<br>• 同時處理"東西類"（thing classes，如人、車等）和"背景類"（stuff classes，如天空、道路等）。 |
| **應用**：<br>• 自動駕駛中的道路和車道檢測。<br>• 醫學影像中的器官和病變區域分割。 | **應用**：<br>• 自動駕駛中的行人和車輛檢測。<br>• 機器人視覺中的物體抓取和操作。 | **應用**：<br>• 高級場景理解，如自動駕駛中的全景感知。<br>• 視頻分析和機器人導航。 |
| **示例**：在一張包含多個人的圖像中，所有屬於"人"的像素都會被標記為"人"，而不區分具體是哪個人。 | **示例**：在一張包含多個人的圖像中，不僅要標記所有"人"的像素，還要區分具體是哪個人，即每個人都有一個獨立的分割掩碼。 | **示例**：在一張包含多個人和背景（如道路、建築物等）的圖像中，不僅要標記每個人的像素並區分具體是哪個人，還要標記背景區域如道路和建築物。 |


### 1.3 經典圖像分割模型

| 名稱 | 作者 | 年份 | 介紹 |
| --- | --- | --- | --- |
| FCN | UC Berkeley | 2015 | FCN 是第一個將卷積神經網絡（CNN）完全應用於圖像分割任務的模型。它通過將全連接層替換為卷積層，使得模型能夠處理任意大小的輸入圖像。 |
| U-Net | 德國弗萊堡大學 | 2015 | U-Net 最初是為生物醫學圖像分割設計的，但它在各種圖像分割任務中表現出色。 |
| DeepLab 系列 | Google | 2016 | DeepLab 系列模型通過引入空洞卷積（Atrous Convolution）和空間金字塔池化（ASPP）等技術，有效地捕捉多尺度上下文信息。DeepLabv3+ 進一步結合了編碼器-解碼器結構。 |
| Mask R-CNN | Meta | 2017 | Mask R-CNN 是一種同時進行目標檢測和實例分割的模型。它在 Faster R-CNN 的基礎上增加了一個分支，用於預測每個檢測到的目標的分割掩碼。 |
| SOLO 系列 | 阿德萊德大學 / 字節跳動 | 2019 | SOLO 系列模型通過將實例分割問題轉化為位置分類問題，簡化了實例分割的流程，並在多個基準測試中取得了優異的性能。 |
| MaskFormer 系列 | Meta | 2021 | MaskFormer 系列通過引入 Transformer 模塊和動態掩碼預測機制，提供了一種統一且高效的分割解決方案。 |


### 1.4 經典訓練數據集

| 數據集名稱 | 介紹 | 數據量 |
| --- | --- | --- |
| COCO | MS COCO 數據集是一個大規模對目標檢測、分割、關鍵點檢測和圖像描述數據集。數據集由 328K 張圖像組成。 | 33 萬張圖片 / 20 萬張有標註 / 80 類類別 / 超過 150 萬個個體數據 |
| ADE20K | ADE20K 語義分割數據集包含超過 20K 個以場景為中心的圖像，這些圖像使用像素級對象和對象部件標籤進行了詳盡的註釋。總共有 150 個語義類別，包括天空、道路、草地等事物，以及人、車、床等離散對象。 | 25000 張照片 / 150 個語義類別 |
| Cityscapes | Cityscapes 是一個大型數據庫，專注於對城市街景的語義理解。它為 30 個類提供語義、實例和密集像素註釋，這些類分為 8 個類別（平面、人、車輛、建築、對象、自然、天空和虛空）。該數據集由大約 5000 張精細註釋圖像和 20000 張粗標圖像組成。 | 5000 張精標圖片 / 20000 張粗標圖片 / 30 個語義類別 / 採集地：德國 / 採集方式：車載相機 |


### 1.5 不同預訓練數據集訓練出的效果

不同預訓練數據集訓練出的效果是不一樣的，主要取決於：

- 數據集自身的數據質量、數據量
- 數據集的主題/內容與目標應用場景的匹配程度
以下比較比Mask2Former模型為例

| 原圖 | COCO（Panoptic） | ADE20K（Semantic） | Cityscape（Semantic） | Mapiliary Vistas（Semantic） |
| --- | --- | --- | --- | --- |
|  | 分割精細度不足 | 路面細節不夠 | 路面細節不夠 | 車道線、白線框等細節 |
| ![](/blogs/mask2former/b5dbd972-1d48-4a84-943e-e74058bc8648.png?w=280) | ![](/blogs/mask2former/074f3a0f-779e-4921-ab9c-50c5bb25124a.png?w=280) | ![](/blogs/mask2former/b4b7b11f-b04c-444e-b97c-2571fd74ec4f.png?w=280) | ![](/blogs/mask2former/d2945318-420d-4c40-b5b5-04f08d3b46a9.png?w=280) | ![](/blogs/mask2former/2b0d1e29-9171-4f9d-8781-2ad6e57829ef.png?w=280) |
| ![](/blogs/mask2former/3207a5a8-d0ec-482f-a9a6-b673b13b3c67.png?w=280) | ![](/blogs/mask2former/12b182b3-9f5a-41a9-b5a3-88777d62015d.png?w=280) | ![](/blogs/mask2former/7d08f244-2d8c-4978-a881-ad60df67cce3.png?w=280) | ![](/blogs/mask2former/54348bc3-cc4e-467d-a23d-997a73768d84.png?w=280) | ![](/blogs/mask2former/e6925d2d-3ff7-4fce-bdec-f6d05ea74f63.png?w=280) |
| ![](/blogs/mask2former/62bbf8fb-46b1-45c9-b414-9c42939ed0ac.png?w=280) | ![](/blogs/mask2former/9efafff7-8c3b-42a6-a6ed-3a0e5f1ae6b2.png?w=280) | ![](/blogs/mask2former/4e39063a-68cc-42a2-be4b-9e758bf408f7.png?w=280) | ![](/blogs/mask2former/99f0f58c-d037-4368-9bf6-78d16745c8c8.png?w=280) | ![](/blogs/mask2former/67c2deb2-8f4c-4540-9e0e-63facdd08d5b.png?w=280) |
| ![](/blogs/mask2former/041efdfc-24d7-4e5d-85f7-0f5c08bf5f97.png?w=280) | ![](/blogs/mask2former/2011b4ce-816d-4451-a956-4fd9555ff177.png?w=280) | ![](/blogs/mask2former/99ac9bc6-e1be-41c6-a5b3-8c446b186d9f.png?w=280) | ![](/blogs/mask2former/2949b2ed-e593-4734-9b3b-49f3ce311677.png?w=280) | ![](/blogs/mask2former/f3a69799-d936-470a-b101-536e5d835770.png?w=280) |



## 2 Mask2Former系列論文


### 2.1 引入

之前的目標檢測方法，都是需要先通過一共的方式給出框，或者劃分一個大致的範圍。例如RCNN和YOLO。而圖像分割方法，幾乎都是定義為為對每一個像素做分類預測。

| RCNN中的region proposal | YOLO中的grid | FCN | DeepLab |
| --- | --- | --- | --- |
| ![](/blogs/mask2former/0d3d02ba-b2bf-4fce-a142-7d8d3886cfc9.png?w=220) | ![](/blogs/mask2former/c63c0abd-9a42-471d-9fa3-c40dacefa99a.png?w=220) | ![](/blogs/mask2former/a8d426f1-7334-4d56-958b-544e6487c590.png?w=220) | ![](/blogs/mask2former/f776b79c-22a1-4635-a036-9ebb935c8764.png?w=220) |
| 區域提案、候選區特徵提取、類別分類、邊界框迴歸 | 圖像劃分、邊界框預測、類別預測 |  |  |


### 2.2 DETR（2020）

>

核心創新：

- 提出了object query的方法，直接輸出檢測框，避免了提供備選框。
![image.png](/blogs/mask2former/1b805dee-ef06-4a3c-9924-6b636039c3b2.png?full=1)

>

模型總結

1. 圖片經過CNN（Resnet50、Resnet101）做特徵提取，縮小面積，增多通道數。（2048, W/32, H/32）
1. 使用1×1卷積將圖片通道數減少，且reshape成一個序列數據，形狀為 d（256）×HW。
1. 根據x軸和y軸座標，計算position embedding（與Transformer類似的三角函數方法）。
1. 圖片加position embedding進入encoder。
1. 生成N個可訓練的object query（N遠大於圖中可能的物體數（100）），可學習的，初始化為隨機 torch.rand(100, 256)）。
1. 以object query為輸入，進入decoder（standard transformer decode，沒有masked，非自迴歸），輸出N個結果。
1. object_query之間會有自注意層，有助於相互之間通信，減少重複。
1. N個結果經過一個FFN輸出物體的類別預測（有一個類別是空），再經過另一FFN輸出目標框的位置和大小（中心點+寬+高）。
1. 使用匈牙利匹配算法將無序的N個預測與真實的n個物體框做匹配，使得整體的匹配誤差（同Loss）最小。多出的預測結果設置分類為空。
1. 根據匹配結果，計算模型Loss：
  1. Loss = 分類誤差 + 目標框誤差
![image.png](/blogs/mask2former/941f38b9-8eba-43f5-9673-a62063561dcf.png?w=288)

  1. 目標框誤差 = 目標框中心點距離 + 目標框IoU
![image.png](/blogs/mask2former/02b85bf5-4995-4af0-aba8-cd407d204f3a.png?w=240)


缺點：訓練很慢、推斷很慢、對於物體識別效果好，但是對於小物體識別效果並不好（由於Transformer關注全局特徵的特性）


DETR中，隨著訓練的進行，object query得出的目標框一步步接近ground truth。

（因為匈牙利匹配算法的存在，究竟是哪個object query在預測某一指定目標物體是可能在訓練中發生變化的）

[video] citadelattachment-1805501192596934668.mp4
[video] citadelattachment-1805501194878935072.mp4
Transformer Encoder注意力的可視化

每個點更關心自己對應的物體整體

![image.png](/blogs/mask2former/ed17bb95-d7cf-4456-b808-b392571bc745.png?full=1)

Transformer Decoder注意力的可視化

每個框更關心物體的邊界

![image.png](/blogs/mask2former/f4dc4cc3-bb8b-43c2-a27f-b4e7cbb98e18.png?w=336)

Object Query 可視化，綠色表示小框，紅色表示水平大框，藍色表示豎直大框。每個query關注的位置都有一定各自的傾向，並且都會關注中心較大物體。

這100個Object Query就像100個人一樣，各自關注的地方都不一樣

![image.png](/blogs/mask2former/52a5bb38-c852-4a4d-94f3-40f77835a181.png?w=864)


>

論文：[https://arxiv.org/abs/2005.12872](https://arxiv.org/abs/2005.12872)

Reference：

- [知乎-Transformer目標檢測之DETR](https://zhuanlan.zhihu.com/p/387102036)
- [B站-[論文簡析]DETR: End-to-End Object Detection with Transfromers[2005.12872]](https://www.bilibili.com/video/BV1T64y1D7NY/)
- [B站-DETR 論文精讀【論文精讀】](https://www.bilibili.com/video/BV1GB4y1X72R)
- [知乎-不知道DETR怎麼訓練，來看看object query匹配gt的可視化過程](https://zhuanlan.zhihu.com/p/592381828)



### 2.3 MaskFormer（2021）

>

核心創新：

- 根據類別生成mask，而非根據每個pixel預測類別
![image.png](/blogs/mask2former/f1556fb5-18f4-48de-9904-85c199b70ef7.png?full=1)


![image.png](/blogs/mask2former/bcf5355b-20ac-4620-8a9a-629f29032846.png?w=432)

>

模型總結

1. 圖片經過CNN（ResNet50，ResNet101，Swin-Transformer）做特徵提取，縮小面積，增多通道數。
1. 再經過一個pixel decoder（FPN特徵金字塔模型，卷積一層一層擴大），還原成原來的H和W，作為pixel embedding（256）
1. 生成N個可訓練的query（N遠大於圖中可能的物體數），和DETR一樣。
1. N個query進入一個transformer decoder（和DETR一樣），其中多頭注意力中的V和K使用圖像特徵，生成N個結果
1. N個結果經過一個MLP+softmax，生成N個class預測
1. N個結果再經過另外一個MLP，轉化為N個mask embedding（256）
1. 將mask embedding 與 pixel embedding做點積，再經過一個sigmoid，生成N個0-1 mask矩陣
1. 將mask矩陣與class矩陣做點積，得到K個類別各自的分類mask
1. 對於語義分割任務，類型是固定的，不需要做二部圖匹配的，只需要依據像素計算loss即可。（但是論文中一處細節提到，在語義分割中用二部圖匹配效果會更好）
  1. Loss = 分類Loss + mask Loss （與DETR一致）
1. 對於非語義分割任務，比如實例分割，還是需要用到二部圖匹配的。（但實際上MaskFormer在實例分割和全景分割中表現都不是非常好，Mask2Former中專門提到了這點）

缺點：訓練推理很慢、很耗顯存、在實例和全景分割效果沒有語義分割好

用一個語義分割和實例分割的結果，展示了MaskFormer在不同類型分類任務中都有不錯的表現。

![image.png](/blogs/mask2former/376b4026-e4c0-4829-8751-58bdc837949c.png?w=576)

>

論文：[https://arxiv.org/abs/2107.06278](https://arxiv.org/abs/2107.06278)

Reference：

- [B站-[論文簡析]Per-Pixel Classification is Not All You Need for Semantic Seg[2107.06278]](https://www.bilibili.com/video/BV17f4y1A7XR/)



### 2.4 Mask2Former（2021）

>

核心創新：

- 更改Transformer Decoder結構，增加了masked結構
- 在Transformer Decoder中使用提出特徵金字塔結構
![image.png](/blogs/mask2former/afb03827-be46-4e5c-a61f-10e31183799b.png?w=384)

>

模型總結

1. 全圖的交叉注意力收斂較為緩慢，交叉注意力需要許多訓練時間才能學會關注局部對象區域。因此在Transformer Decoder中加入masked attention部分，讓交叉注意力集中在前景區域標準的帶殘差的交叉注意力
  1. 原注意力：
![image.png](/blogs/mask2former/8b985dab-1b07-4612-bf1c-6c4518a4b2db.png?w=192)

  1. 改進後：
![image.png](/blogs/mask2former/a9f081ad-92a1-4eb0-871d-16686c7e9956.png?w=288)

  1. 其中
![image.png](/blogs/mask2former/60226e96-f338-4f68-96dd-39e1cf57c251.png?w=240)

M_{l-1}(x,y)代表前一層decoder的mask prediction

1. 在Transformer Decoder中，有L個3層結構，每個3層結構，其中的每一層的V和K，使用的是pixel decoder中放縮程度不一樣的image features
1. 在Transformer Decoder中，先做masked attention，再做self attention。
1. 評估loss的時候並不用全圖，而是隨機採樣點

模型評估結果

全景分割

![image.png](/blogs/mask2former/092f6ee7-157e-418f-887f-6a6b99c2133e.png?full=1)

實例分割

![image.png](/blogs/mask2former/9bfcce90-be11-45e9-acce-640d96bcf992.png?full=1)

語義分割

![image.png](/blogs/mask2former/bc116231-b2ef-4cdd-8956-c3c3c611a734.png?w=288)

同樣的4個query在不同圖片中關注的位置相對固定，query實質上起到了“region proposals”的作用

![image.png](/blogs/mask2former/1f522e7b-29e5-47af-8b4b-36d02c9fab41.png?w=384)

>

論文：[https://arxiv.org/abs/2112.01527](https://arxiv.org/abs/2112.01527)

Reference：

- [B站-[論文速覽]Masked-attention Mask Tr. for Universal Image Segmentation[2112.01527]](https://www.bilibili.com/video/BV1ob4y1B7hp/)
