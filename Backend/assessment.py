SKILL_QUESTIONS = {
    "skill_active_learning":
        "How interested are you in learning new things and improving your knowledge?",

    "skill_active_listening":
        "How well do you listen and understand what other people are saying?",

    "skill_critical_thinking":
        "How good are you at analyzing problems and evaluating different solutions?",

    "skill_learning_strategies":
        "How good are you at choosing effective ways to learn something new?",

    "skill_mathematics":
        "How comfortable are you with mathematical calculations and concepts?",

    "skill_monitoring":
        "How good are you at checking your work and identifying mistakes?",

    "skill_reading_comprehension":
        "How well do you understand written information and instructions?",

    "skill_science":
        "How comfortable are you with scientific concepts and problem solving?",

    "skill_speaking":
        "How comfortable are you explaining your ideas to other people?",

    "skill_writing":
        "How comfortable are you expressing your ideas clearly in writing?"
}

ABILITY_QUESTIONS = {
    "ability_arm_hand_steadiness":
        "How well can you keep your hands steady while doing precise tasks?",

    "ability_auditory_attention":
        "How well can you focus on important sounds while ignoring distractions?",

    "ability_category_flexibility":
        "How easily can you change your way of thinking when a situation changes?",

    "ability_control_precision":
        "How accurately can you control your movements during detailed tasks?",

    "ability_deductive_reasoning":
        "How good are you at using facts and rules to reach a logical conclusion?",

    "ability_depth_perception":
        "How well can you judge distance and the relative position of objects?",

    "ability_dynamic_flexibility":
        "How easily can you change your body position while performing an activity?",

    "ability_dynamic_strength":
        "How comfortable are you with tasks that require physical strength?",

    "ability_explosive_strength":
        "How capable are you of producing a strong physical effort quickly?",

    "ability_extent_flexibility":
        "How easily can you reach, bend, or stretch your body when needed?",

    "ability_far_vision":
        "How well can you see objects clearly from a distance?",

    "ability_finger_dexterity":
        "How well can you perform precise tasks using your fingers?",

    "ability_flexibility_of_closure":
        "How quickly can you recognize a familiar object or pattern when information is incomplete?",

    "ability_fluency_of_ideas":
        "How easily can you generate many ideas when solving a problem?",

    "ability_glare_sensitivity":
        "How well can you see and work when there are changes in brightness or glare?",

    "ability_gross_body_coordination":
        "How well can you coordinate your body movements during physical activities?",

    "ability_gross_body_equilibrium":
        "How well can you maintain your balance during physical activities?",

    "ability_hearing_sensitivity":
        "How well can you notice differences in sounds and hear important details?",

    "ability_inductive_reasoning":
        "How good are you at identifying patterns and using them to reach a general conclusion?",

    "ability_information_ordering":
        "How good are you at arranging information or steps in the correct order?",

    "ability_manual_dexterity":
        "How skilled are you at using your hands to perform controlled tasks?",

    "ability_mathematical_reasoning":
        "How good are you at understanding and applying mathematical concepts?",

    "ability_memorization":
        "How easily can you remember information and recall it when needed?",

    "ability_multilimb_coordination":
        "How well can you coordinate movements of multiple limbs at the same time?",

    "ability_near_vision":
        "How well can you see and work with objects or information close to you?",

    "ability_night_vision":
        "How well can you see and work in low-light conditions?",

    "ability_number_facility":
        "How quickly and accurately can you work with numbers?",

    "ability_oral_comprehension":
        "How well do you understand spoken information and instructions?",

    "ability_oral_expression":
        "How clearly can you express your thoughts and ideas when speaking?",

    "ability_originality":
        "How good are you at creating original ideas or solutions?",

    "ability_perceptual_speed":
        "How quickly can you notice and compare details or changes?",

    "ability_peripheral_vision":
        "How well can you notice objects or movement outside your direct line of sight?",

    "ability_problem_sensitivity":
        "How quickly can you recognize that a problem exists?",

    "ability_rate_control":
        "How well can you control the speed of your movements or activities?",

    "ability_reaction_time":
        "How quickly can you respond when something unexpected happens?",

    "ability_response_orientation":
        "How quickly can you choose an appropriate response to a situation?",

    "ability_selective_attention":
        "How well can you focus on one important task while ignoring distractions?",

    "ability_sound_localization":
        "How well can you identify where a sound is coming from?",

    "ability_spatial_orientation":
        "How well can you understand where objects are located relative to each other?",

    "ability_speech_clarity":
        "How clearly can you pronounce and communicate words when speaking?",

    "ability_speech_recognition":
        "How easily can you understand spoken words, even when there are distractions?",

    "ability_speed_of_closure":
        "How quickly can you recognize a meaningful pattern from incomplete information?",

    "ability_speed_of_limb_movement":
        "How quickly can you move your arms, hands, or legs when required?",

    "ability_stamina":
        "How well can you continue physical activity for an extended period?",

    "ability_static_strength":
        "How comfortable are you with tasks requiring sustained physical strength?",

    "ability_time_sharing":
        "How well can you divide your attention between multiple tasks?",

    "ability_trunk_strength":
        "How capable are you of performing tasks that require strength in your core or trunk?",

    "ability_visual_color_discrimination":
        "How well can you distinguish between different colors?",

    "ability_visualization":
        "How easily can you visualize how objects will look when moved or changed?",

    "ability_wrist_finger_speed":
        "How quickly and accurately can you move your fingers and wrists during detailed tasks?",

    "ability_written_comprehension":
        "How well do you understand written information?",

    "ability_written_expression":
        "How clearly can you express your thoughts in written form?"
}


INTEREST_QUESTIONS = {
    "interest_artistic":
        "How interested are you in creative activities such as design, art, or writing?",

    "interest_conventional":
        "How interested are you in organized work involving data, records, and procedures?",

    "interest_enterprising":
        "How interested are you in business, leadership, sales, or entrepreneurship?",

    "interest_investigative":
        "How interested are you in research, analysis, science, and solving complex problems?",

    "interest_realistic":
        "How interested are you in practical work involving machines, tools, technology, or physical activities?",

    "interest_social":
        "How interested are you in helping, teaching, guiding, or working with other people?"
}


def rating_to_score(rating: int) -> float:
    """
    Convert a student rating from 1-5
    to a 0-100 score.
    """

    if rating < 1 or rating > 5:
        raise ValueError("Rating must be between 1 and 5.")

    return (rating - 1) * 25
def create_feature_vector(answers):
    """
    Convert student answers into a 68-feature vector.

    answers:
        Dictionary containing feature names and ratings from 1 to 5.
    """

    feature_vector = []

    all_questions = {
        **SKILL_QUESTIONS,
        **ABILITY_QUESTIONS,
        **INTEREST_QUESTIONS
    }

    for feature in all_questions.keys():

        if feature not in answers:
            raise ValueError(
                f"Missing answer for: {feature}"
            )

        rating = answers[feature]

        score = rating_to_score(rating)

        feature_vector.append(score)

    return feature_vector