window.RESEARCH_DATA = {
  "total": 18756,
  "unit": "例",
  "cohorts": [
    {
      "id": "c1-biopsy",
      "label": "C1-天肿穿刺",
      "count": 14868,
      "color": "#156a70"
    },
    {
      "id": "c1-resection",
      "label": "C1-天肿大切",
      "count": 192,
      "color": "#b15c40"
    },
    {
      "id": "c3",
      "label": "C3-云肿",
      "count": 2005,
      "color": "#5e829b"
    },
    {
      "id": "brca",
      "label": "Cx-BRCA",
      "count": 1135,
      "color": "#9a7caa"
    },
    {
      "id": "brcas",
      "label": "Cx-BRCAS",
      "count": 556,
      "color": "#b49b51"
    }
  ],
  "method": {
    "verified": false,
    "status": "CLS 聚合与学生 16 Patch 对应结构已由用户确认；交叉配对、聚合算子及维度权重待核对",
    "teacher": "H-optimus-1",
    "student": "BRIGHT-Flash-ex",
    "routes": [
      {
        "id": "cc",
        "label": "CLS → CLS",
        "source": "CLS",
        "target": "CLS",
        "confirmed": true,
        "note": "教师 16 个 CLS token 聚合为 1 个目标，学生 1 个 CLS token 经学生 CLS 投影后逼近该目标；聚合算子待核对。"
      },
      {
        "id": "cp",
        "label": "CLS → Patch",
        "source": "CLS",
        "target": "Patch",
        "confirmed": false,
        "note": "候选交叉路径示意；是否为原四路之一，以及跨粒度构造方式，待核对原实现。"
      },
      {
        "id": "pc",
        "label": "Patch → CLS",
        "source": "Patch",
        "target": "CLS",
        "confirmed": false,
        "note": "候选交叉路径示意；是否为原四路之一，以及跨粒度构造方式，待核对原实现。"
      },
      {
        "id": "pp",
        "label": "Patch → Patch",
        "source": "Patch",
        "target": "Patch",
        "confirmed": true,
        "note": "学生 16 个 Patch token 经学生 Patch 投影后，逐一对应教师 16 个 tile 的 Patch 目标；教师 tile 内目标构造待核对。"
      }
    ],
    "studentPatchTokens": 16,
    "teacherClsInputCount": 16,
    "teacherClsTargetCount": 1
  },
  "pipelines": [
    {
      "id": "P1",
      "backbone": "1007",
      "sngp": "SNGP-1007",
      "encoder": "BRIGHT-S"
    },
    {
      "id": "P2",
      "backbone": "1007",
      "sngp": "SNGP-1007",
      "encoder": "H-optimus-1"
    },
    {
      "id": "P3",
      "backbone": "ex",
      "sngp": "SNGP-ex",
      "encoder": "BRIGHT-S"
    },
    {
      "id": "P4",
      "backbone": "ex",
      "sngp": "SNGP-ex",
      "encoder": "H-optimus-1"
    }
  ]
};
