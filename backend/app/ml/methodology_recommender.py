import re
from typing import Dict, Any, List

class MethodologyRecommender:
    def __init__(self):
        pass

    def recommend(
        self,
        research_question: str,
        domain: str,
        data_type: str,
        hardware_constraint: str = "standard"
    ) -> Dict[str, Any]:
        
        q_lower = research_question.lower()
        d_lower = domain.lower()
        dt_lower = data_type.lower()
        hw_lower = hardware_constraint.lower()

        # Decision Logic based on data modality, task semantics, and constraints
        if "detect" in q_lower or "yolo" in q_lower or ("image" in dt_lower and ("bound" in q_lower or "traffic" in q_lower or "object" in q_lower or "defect" in q_lower)):
            if "edge" in hw_lower:
                model_name = "YOLOv8n / RT-DETR-Tiny (Quantized INT8)"
                alt_models = ["MobileNetV3-SSDLite", "NanoDet-Plus"]
            else:
                model_name = "YOLOv8x / Co-DETR with Swin-Large Backbone"
                alt_models = ["Faster R-CNN with FPN", "Deformable DETR"]

            category = "Single-Stage Anchor-Free Object Detector"
            rationale = "Object detection requires multi-scale bounding box regression and class classification. YOLOv8 offers an optimal trade-off between inference FPS and mean Average Precision (mAP@0.5:0.95)."
            pipeline_steps = [
                "Dataset labeling with Roboflow / CVAT and conversion to YOLO TXT format.",
                "Spatial data augmentations: Mosaic, MixUp, HSV jitter, and random perspective.",
                "Transfer learning from COCO pre-trained weights using SGD/AdamW with Cosine Annealing LR.",
                "Benchmark mAP@0.5:0.95, Precision, Recall, and inference latency (FPS) on test split.",
                "Export checkpoint to ONNX / OpenVINO / TensorRT for deployment."
            ]
            metrics = ["mAP@0.5", "mAP@0.5:0.95", "FPS Latency (ms)", "Precision", "Recall"]
            code_frameworks = ["Ultralytics PyTorch", "OpenCV", "ONNX Runtime"]

        elif "segment" in q_lower or "mri" in q_lower or "ultrasound" in q_lower or "ct" in q_lower or ("image" in dt_lower and "medical" in d_lower):
            model_name = "nnU-Net / Swin-UNETR (Vision Transformer UNet)"
            category = "Biomedical Semantic Segmentation Network"
            alt_models = ["TransUNet", "DeepLabV3+", "Mask2Former"]
            rationale = "Medical image segmentation demands precise boundary delineation. nnU-Net dynamically self-adapts spatial preprocessing and loss functions (Dice + Cross-Entropy) to biomedical volumetric data."
            pipeline_steps = [
                "DICOM / NIfTI normalization, intensity windowing (Hounsfield units), and resampling.",
                "Patch-based slicing with elastic deformations, random rotation, and contrast scaling.",
                "Training with hybrid Dice Loss + Focal Loss to counteract extreme foreground-background class imbalance.",
                "Evaluation via 5-Fold Cross-Validation on Dice Similarity Coefficient (DSC) and 95% Hausdorff Distance (HD95).",
                "Bedside slice-by-slice contour overlay rendering for clinical validation."
            ]
            metrics = ["Dice Similarity Coefficient (DSC)", "IoU / Jaccard Index", "95% Hausdorff Distance (HD95)"]
            code_frameworks = ["MONAI PyTorch", "SimpleITK", "TorchIO"]

        elif "text" in dt_lower or "nlp" in d_lower or "summar" in q_lower or "sentiment" in q_lower or "question" in q_lower or "rag" in q_lower:
            if "rag" in q_lower or "retriev" in q_lower or "hallucinat" in q_lower:
                model_name = "Hybrid Dense-Sparse RAG (BM25 + ColBERTv2) + LLaMA-3-8B / Mistral"
                category = "Retrieval-Augmented Generation & Dense Passage Retrieval"
                alt_models = ["BGE-M3 + LangChain", "Contriever + T5-XXL"]
                rationale = "Knowledge-grounded QA requires verifiable provenance. A hybrid retriever mitigates semantic drift while modern quantized LLMs provide accurate synthesis without parameter retraining."
                pipeline_steps = [
                    "Document chunking (500 tokens with 100 token overlap) and metadata enrichment.",
                    "Dual-index generation: Sparse BM25 index + Dense FAISS index using BGE-Large embeddings.",
                    "Reciprocal Rank Fusion (RRF) with Cross-Encoder re-ranking (bge-reranker-large).",
                    "Constrained generation prompt with strict in-context citation constraints.",
                    "Evaluation using RAGAS framework: Faithfulness, Answer Relevance, and Context Recall."
                ]
                metrics = ["Faithfulness (RAGAS)", "Context Precision", "Answer Relevance", "ROUGE-L"]
                code_frameworks = ["Hugging Face Transformers", "FAISS", "LangChain / LlamaIndex"]
            else:
                model_name = "DeBERTa-v3-Large / RoBERTa (with LoRA Parameter-Efficient Tuning)"
                category = "Bidirectional Encoder Transformer"
                alt_models = ["BERT-Base", "DistilBERT", "ELECTRA"]
                rationale = "Disentangled attention in DeBERTa-v3 captures nuanced syntactic dependencies, making it state-of-the-art for sequence classification and token tagging."
                pipeline_steps = [
                    "Tokenization using WordPiece/Byte-Pair Encoding with dynamic batch padding.",
                    "Warmup cosine learning rate schedule with AdamW optimizer (weight decay 0.01).",
                    "Layer-wise learning rate decay (LLRD) and gradient accumulation.",
                    "Macro-F1, Precision, and Recall computation on held-out stratified test set.",
                    "Error analysis via confusion matrix and attention weight saliency inspection."
                ]
                metrics = ["Macro-F1 Score", "Accuracy", "AUROC", "Cohen's Kappa"]
                code_frameworks = ["Hugging Face Transformers", "PyTorch", "PEFT"]

        elif "graph" in dt_lower or "network" in dt_lower or "cyber" in d_lower or "malware" in q_lower:
            model_name = "Graph Attention Network (GATv2) / Relational Graph Convolutional Network"
            category = "Geometric Deep Learning / Graph Neural Network"
            alt_models = ["GraphSAGE", "GCN (Kipf & Welling)", "DeepWalk"]
            rationale = "Cybersecurity telemetry and social network dynamics possess non-Euclidean relational structure. GATv2 weighs neighborhood node interactions dynamically to identify malicious subgraphs."
            pipeline_steps = [
                "Graph construction: Nodes = entities (IPs, processes), Edges = interactions (connections, API calls).",
                "Node feature extraction (entropy, degree centrality, behavioral histograms).",
                "Inductive mini-batch neighborhood sampling using NeighborLoader in PyG.",
                "Cross-entropy training with edge dropout to prevent over-smoothing.",
                "Node classification / link prediction evaluation on unseen network topologies."
            ]
            metrics = ["AUROC", "Average Precision (PR-AUC)", "F1-Score", "False Positive Rate (FPR)"]
            code_frameworks = ["PyTorch Geometric (PyG)", "NetworkX", "DGL"]

        elif "time" in dt_lower or "forecast" in q_lower or "vital" in q_lower:
            model_name = "Temporal Fusion Transformer (TFT) / Informer"
            category = "Multi-Horizon Deep Time-Series Architecture"
            alt_models = ["LSTM / GRU with Attention", "N-BEATS", "Prophet + XGBoost"]
            rationale = "Temporal Fusion Transformers handle static metadata, observed time-varying inputs, and known future inputs while providing interpretable variable selection weights."
            pipeline_steps = [
                "Missing data imputation (forward fill + spline) and sliding window time-step creation.",
                "Feature scaling and calendar/cyclical time encoding (hour, day of week).",
                "Multi-horizon quantile loss training for uncertainty intervals (p10, p50, p90).",
                "Backtesting across rolling cross-validation splits.",
                "Feature importance inspection through attention weight visualization."
            ]
            metrics = ["Mean Absolute Error (MAE)", "Root Mean Squared Error (RMSE)", "sMAPE", "Quantile Loss"]
            code_frameworks = ["PyTorch Forecasting", "Darts", "Statsmodels"]

        else:
            # Default tabular / general prediction
            model_name = "Gradient Boosted Decision Trees (XGBoost / LightGBM) + TabNet"
            category = "Tree-Based Ensemble & Attentive Neural Tabular Network"
            alt_models = ["Random Forest", "CatBoost", "Multilayer Perceptron"]
            rationale = "On structured and tabular numerical datasets, tree boosting algorithms systematically outperform deep neural nets in accuracy, training speed, and resistance to unnormalized outliers."
            pipeline_steps = [
                "Exploratory data analysis, outlier clipping, and missing value imputation.",
                "Feature engineering: cross-feature interactions, frequency encoding, and binning.",
                "Bayesian hyperparameter optimization (Optuna) for learning rate, depth, and regularization.",
                "Stratified 5-fold cross-validation with out-of-fold prediction ensembling.",
                "SHAP (Shapley Additive Explanations) global and local feature attribution calculation."
            ]
            metrics = ["AUROC", "Log-Loss", "F1-Score", "Brier Calibration Score", "RMSE"]
            code_frameworks = ["XGBoost", "Scikit-Learn", "LightGBM", "SHAP"]

        return {
            "recommended_model": model_name,
            "algorithm_category": category,
            "rationale": rationale,
            "pipeline_steps": pipeline_steps,
            "alternative_models": alt_models,
            "suggested_metrics": metrics,
            "code_frameworks": code_frameworks
        }

methodology_recommender = MethodologyRecommender()

