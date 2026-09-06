from typing import List, Dict, Any, Optional

class RecommendationEngine:
    """
    iGOT Karmayogi Course Recommendation Engine.
    Maps assessed competency gap deficit vectors against the iGOT course catalog,
    ranks personalized learning pathways, and manages xAPI/SCORM feedback loops.
    """

    @staticmethod
    def calculate_gap_vector(
        assessed_proficiency: Dict[str, int],
        target_proficiency: Dict[str, int]
    ) -> Dict[str, int]:
        """
        Calculates Delta C_m = max(0, Target - Assessed) for each competency.
        """
        gap_vector = {}
        for comp_code, target in target_proficiency.items():
            assessed = assessed_proficiency.get(comp_code, 50)
            gap = max(0, target - assessed)
            gap_vector[comp_code] = gap
        return gap_vector

    @staticmethod
    def rank_courses_for_learner(
        gap_vector: Dict[str, int],
        available_courses: List[Dict[str, Any]],
        cadre: str = "JSO"
    ) -> List[Dict[str, Any]]:
        """
        Ranks iGOT Karmayogi courses by relevance to identified competency deficits.
        R_course = (Delta C_m * MatchScore) * RelevanceWeight
        """
        ranked_courses = []

        for course in available_courses:
            comp_id = course.get("competency_code") or course.get("competency_id", "")
            gap = gap_vector.get(comp_id, 0)

            # If officer has a gap in this competency, calculate priority score
            match_score = 1.0
            relevance_weight = 1.2 if gap > 20 else (1.0 if gap > 5 else 0.5)

            score = (gap * match_score) * relevance_weight

            # Add priority metadata
            priority_tag = "MANDATORY" if gap >= 25 else ("RECOMMENDED" if gap >= 10 else "OPTIONAL")

            ranked_courses.append({
                **course,
                "gap_addressed": gap,
                "recommendation_score": round(score, 2),
                "priority_tag": priority_tag,
                "estimated_hours": max(2, round(course.get("duration_minutes", 120) / 60, 1)),
                "is_completed": bool(course.get("completed", 0)),
                "is_enrolled": bool(course.get("enrolled", 0))
            })

        # Sort descending by recommendation score
        ranked_courses.sort(key=lambda x: (not x["is_completed"], x["recommendation_score"]), reverse=True)
        return ranked_courses

recommendation_engine = RecommendationEngine()
