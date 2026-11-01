import re
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer

DOMAIN_GAP_KNOWLEDGE_BASE = {
    "computer vision": [
        {
            "category": "Edge & Real-World Deployment",
            "gap_title": "Severe Accuracy Degradation Under Adverse Weather (Fog, Rain, Night) on Low-Wattage Edge Devices",
            "description": "Most published vision models (YOLO, DETR, Mask R-CNN) benchmark on clean, well-lit datasets (COCO, Cityscapes). When quantized to INT8 for edge Jetson/Raspberry Pi deployment under adverse weather, mAP drops by over 38%.",
            "potential_novelty": "High — developing weather-invariant feature adaptation without increasing inference latency.",
            "recommended_direction": "Investigate physics-guided neural networks or lightweight optical flow de-hazing branches fused before the backbone."
        },
        {
            "category": "Data & Domain Generalization",
            "gap_title": "Lack of Multi-Camera 3D Spatial-Temporal Tracking in Occluded Campus/Intersection Environments",
            "description": "Single-camera tracking fails during cross-camera handoffs in occluded university campus environments. Existing multi-target multi-camera (MTMC) datasets are proprietary or lack diverse occlusion angles.",
            "potential_novelty": "Moderate-High — novel re-identification graph formulation across non-overlapping fields of view.",
            "recommended_direction": "Apply Spatio-Temporal Graph Attention Networks (ST-GAT) constrained by camera topological distance matrices."
        },
        {
            "category": "Methodological & Robustness",
            "gap_title": "Vulnerability to Physical Adversarial Patch Attacks on Traffic Sign Classifiers",
            "description": "Standard convolutional backbones remain highly susceptible to small printed adversarial stickers on stop signs and lane markers, posing acute autonomous navigation risks.",
            "potential_novelty": "High — provable certified defense against patch perturbations on edge architectures.",
            "recommended_direction": "Implement randomized smoothing combined with localized masked spatial autoencoders."
        }
    ],
    "natural language processing": [
        {
            "category": "Methodological & Hallucination",
            "gap_title": "Unreliable Citation Attribution and Latent Knowledge Conflicts in Domain RAG Systems",
            "description": "Retrieval-Augmented Generation frequently hallucinates source document passages or combines facts from contradictory historical documents without flagging epistemic uncertainty.",
            "potential_novelty": "Very High — verifiable provenance graphs for high-stakes decision workflows (academic, medical, legal).",
            "recommended_direction": "Construct fine-grained citation alignment modules using token-level NLI entailment scoring."
        },
        {
            "category": "Data & Resource Accessibility",
            "gap_title": "Low-Resource Cross-Lingual Transfer Deficit in Technical and Academic Jargon",
            "description": "Multilingual models (mBERT, XLM-R) perform well on colloquial text but collapse on domain-specific academic terminology in Southeast Asian and African regional dialects.",
            "potential_novelty": "High — parameter-efficient alignment adapters with bilingual academic glossaries.",
            "recommended_direction": "Build contrastive cross-lingual embedding alignment leveraging Wikipedia and open educational repos."
        },
        {
            "category": "Evaluation & Benchmark",
            "gap_title": "Evaluation Leakage and Benchmark Saturation in Academic Summarization Metrics (ROUGE/BLEU)",
            "description": "Standard metrics like ROUGE-L reward verbatim n-gram copying rather than conceptual synthesis, methodology comparison, or scientific rigor.",
            "potential_novelty": "Moderate-High — semantic claim-based evaluation metric tailored for scientific literature review.",
            "recommended_direction": "Develop a dual-agent critic framework evaluating factual faithfulness, novelty extraction, and limitation detection."
        }
    ],
    "healthcare ai": [
        {
            "category": "Explainability & Clinical Safety",
            "gap_title": "Disconnection Between Post-Hoc Saliency Maps and Physician Diagnostic Decision Paths",
            "description": "Gradient-based saliency maps (Grad-CAM) frequently highlight spurious background artifacts (e.g., hospital bed markers) rather than pathological biomarkers, diminishing clinician trust.",
            "potential_novelty": "Very High — inherently interpretable concept-bottleneck architectures for medical imaging.",
            "recommended_direction": "Employ Concept Bottleneck Models (CBMs) where intermediate representations explicitly correspond to standardized clinical criteria."
        },
        {
            "category": "Data & Generalization",
            "gap_title": "Multi-Center Domain Shift and Calibration Failure in EHR Intensive Care Prediction",
            "description": "Models trained on MIMIC-IV fail when transferred to different EHR vendors or non-tertiary hospitals due to varying lab test sampling frequencies.",
            "potential_novelty": "High — domain-adversarial continuous training with uncertainty quantification.",
            "recommended_direction": "Incorporate conformal prediction guarantees to output valid prediction intervals rather than overconfident point estimates."
        }
    ],
    "cybersecurity ai": [
        {
            "category": "Methodological & Adversarial",
            "gap_title": "Evasion of Behavioral ML Intrusion Detectors via Concept Drift and Mimicry Attacks",
            "description": "Attackers disguise malicious API call sequences by injecting benign dummy system calls, easily fooling static sequence classifiers.",
            "potential_novelty": "High — robust invariant behavioral graph mining invariant to benign noise injection.",
            "recommended_direction": "Formulate intrusion detection as dynamic temporal provenance graphs with substructure graph kernels."
        }
    ]
}

class ResearchGapAssistant:
    def __init__(self):
        self.knowledge_base = DOMAIN_GAP_KNOWLEDGE_BASE

    def analyze_gaps(self, topic: str, domain: str, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        target_domain = domain.lower()
        matched_category_key = None
        
        for k in self.knowledge_base.keys():
            if k in target_domain or target_domain in k:
                matched_category_key = k
                break
                
        if not matched_category_key:
            matched_category_key = "computer vision" if "vision" in topic.lower() or "image" in topic.lower() else "natural language processing"

        base_gaps = self.knowledge_base.get(matched_category_key, self.knowledge_base["natural language processing"])
        
        enriched_gaps = []
        user_kw_str = ", ".join(keywords) if keywords else topic
        
        for idx, gap in enumerate(base_gaps):
            custom_title = gap["gap_title"]
            custom_desc = gap["description"]
            
            # Contextualize with user's topic
            if idx == 0:
                custom_desc += f" Specifically for your focus on '{topic}', benchmarking this gap provides immediate university capstone novelty."

            enriched_gaps.append({
                "id": idx + 1,
                "gap_title": custom_title,
                "category": gap["category"],
                "description": custom_desc,
                "potential_novelty": gap["potential_novelty"],
                "recommended_direction": gap["recommended_direction"],
                "feasibility_for_university_project": "Very High (Can be completed in 8-12 weeks with open benchmarks)",
                "verification_note": "Candidate academic research gap — verify against the latest 2024-2026 conference literature."
            })
            
        return enriched_gaps

gap_assistant = ResearchGapAssistant()

