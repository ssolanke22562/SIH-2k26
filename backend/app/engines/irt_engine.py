import math
import numpy as np
from typing import List, Dict, Any, Optional, Tuple

class IRTEngine:
    """
    Psychometric Adaptive Testing Engine based on 2-Parameter Logistic (2PL) Item Response Theory (IRT)
    and Computerized Adaptive Testing (CAT).
    """

    @staticmethod
    def probability_correct(theta: float, a: float, b: float) -> float:
        """
        Calculates P(Y = 1 | theta, a, b) = 1 / (1 + exp(-a * (theta - b)))
        where:
          theta = latent ability of examinee (-3.0 to +3.0)
          a = item discrimination parameter (0.5 to 2.5)
          b = item difficulty parameter (-3.0 to +3.0)
        """
        val = -a * (theta - b)
        # Prevent overflow in exp
        val = max(-15.0, min(15.0, val))
        return 1.0 / (1.0 + math.exp(val))

    @staticmethod
    def fisher_information(theta: float, a: float, b: float) -> float:
        """
        Calculates Fisher Information: I(theta) = a^2 * P(theta) * (1 - P(theta))
        Used to select the question that provides the highest diagnostic precision at current theta.
        """
        p = IRTEngine.probability_correct(theta, a, b)
        return (a ** 2) * p * (1.0 - p)

    @staticmethod
    def select_optimal_next_item(
        theta: float,
        candidate_items: List[Dict[str, Any]],
        administered_ids: List[str]
    ) -> Optional[Dict[str, Any]]:
        """
        Selects the unadministered item that maximizes Fisher Information at current theta.
        """
        available = [item for item in candidate_items if item["id"] not in administered_ids]
        if not available:
            return None

        best_item = None
        max_info = -1.0

        for item in available:
            a = float(item.get("irt_a_discrimination", 1.0))
            b = float(item.get("irt_b_difficulty", 0.0))
            info = IRTEngine.fisher_information(theta, a, b)
            if info > max_info:
                max_info = info
                best_item = item

        return best_item

    @staticmethod
    def update_theta_mle(
        current_theta: float,
        administered_items: List[Dict[str, Any]],
        responses: List[int]
    ) -> Tuple[float, float]:
        """
        Updates latent ability estimate (theta) using Newton-Raphson / Expected A Posteriori (EAP) method
        and computes Standard Error SE(theta).
        Returns: (new_theta, standard_error)
        """
        if not administered_items or len(administered_items) != len(responses):
            return current_theta, 1.0

        # If all correct or all wrong, apply Bayesian bounded step
        num_correct = sum(responses)
        total = len(responses)

        # Newton-Raphson iteration with Gaussian prior (mean=0, sd=1) for stability
        theta = current_theta
        for _ in range(10):
            first_deriv = -theta  # Prior component d/d_theta of standard normal prior
            second_deriv = -1.0   # Prior second deriv

            for item, resp in zip(administered_items, responses):
                a = float(item.get("irt_a_discrimination", 1.0))
                b = float(item.get("irt_b_difficulty", 0.0))
                p = IRTEngine.probability_correct(theta, a, b)

                first_deriv += a * (resp - p)
                second_deriv -= (a ** 2) * p * (1.0 - p)

            if abs(second_deriv) < 1e-6:
                break

            step = first_deriv / second_deriv
            theta = theta - step
            theta = max(-3.0, min(3.0, theta))

            if abs(step) < 0.001:
                break

        # Calculate Test Information & Standard Error
        total_info = 1.0  # prior info
        for item in administered_items:
            a = float(item.get("irt_a_discrimination", 1.0))
            b = float(item.get("irt_b_difficulty", 0.0))
            total_info += IRTEngine.fisher_information(theta, a, b)

        se = 1.0 / math.sqrt(max(0.1, total_info))
        return round(theta, 3), round(se, 3)

    @staticmethod
    def theta_to_proficiency_score(theta: float) -> int:
        """
        Converts IRT latent ability theta (-3.0 to +3.0) into standard MoSPI proficiency score (0 to 100).
        """
        # Standard normal CDF sigmoid approximation scaled to 0 - 100
        score = 100.0 / (1.0 + math.exp(-1.1 * theta))
        return int(max(5, min(98, round(score))))

    @staticmethod
    def calculate_competency_gaps(
        proficiency_scores: Dict[str, int],
        target_scores: Dict[str, int]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Computes gap vector Delta C_m = max(0, Target - Assessed) for each competency.
        """
        results = {}
        for code, target in target_scores.items():
            assessed = proficiency_scores.get(code, 50)
            gap = max(0, target - assessed)
            status = "PROFICIENT" if gap <= 5 else ("MODERATE_GAP" if gap <= 20 else "CRITICAL_GAP")
            results[code] = {
                "target_proficiency": target,
                "assessed_proficiency": assessed,
                "gap": gap,
                "status": status
            }
        return results
