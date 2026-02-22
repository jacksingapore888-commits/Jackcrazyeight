# Crazy Eights - Jack's Edition

这是一个使用 React + Vite + Tailwind CSS 构建的经典《疯狂 8 点》纸牌游戏。

## 如何同步到 GitHub 并部署到 Vercel

### 1. 同步到 GitHub

1.  在 GitHub 上创建一个新的代码仓库（Repository）。
2.  在本地终端中运行以下命令（如果你在 AI Studio 外部操作）：
    ```bash
    git init
    git add .
    git commit -m "Initial commit: Crazy Eights game"
    git branch -M main
    git remote add origin <你的 GitHub 仓库 URL>
    git push -u origin main
    ```

### 2. 部署到 Vercel

1.  登录 [Vercel 官网](https://vercel.com/)。
2.  点击 **"Add New"** -> **"Project"**。
3.  导入你刚刚创建的 GitHub 仓库。
4.  在 **"Environment Variables"** 部分，添加以下变量（如果你的代码中使用了它们）：
    *   `GEMINI_API_KEY`: 你的 Google AI API 密钥。
5.  点击 **"Deploy"**。

Vercel 会自动识别这是一个 Vite 项目，并执行 `npm run build` 进行构建。

## 项目结构

*   `src/App.tsx`: 游戏主逻辑和 UI。
*   `src/components/`: 可复用的 UI 组件（卡片、花色选择器）。
*   `src/constants.ts`: 游戏常量和工具函数。
*   `src/types.ts`: TypeScript 类型定义。

## 游戏规则

*   **匹配**: 出牌必须与弃牌堆顶部的牌花色或点数相同。
*   **万能 8 点**: 数字 8 是万能牌，可以在任何时候打出，并指定新的花色。
*   **摸牌**: 无牌可出时必须摸一张牌。
*   **获胜**: 最先清空手牌的一方获胜。
