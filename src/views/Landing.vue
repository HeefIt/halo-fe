<!--
  Landing 落地页组件
  功能描述：未登录用户看到的前美化落地页
  主要功能：
    - 导航栏：提供下拉菜单访问题库、资源、关于我们
    - 登陆注册按钮：帮助未登录用户速速登陆/注册
    - 横幼年区域：作为CTA区域，梨化用户注册、上传题库
    - 特色功能展示：晚示平台特色（全面题库、智能分析、成就系统）
    - 数据统计展示：简洁的数字展示（题目数、用户数、面试通过率）
    - 上传资源鏝接：LeetCode、牛客网、CSDN、GitHub等是外部资源鼓务
  使用位置：路由 / (随机轮帺)
-->
<template>
  <div class="landing-page">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container">
        <div class="nav-content">
          <!-- Logo -->
          <div class="logo">
            <h1>Halo 刷题网</h1>
          </div>
          
          <!-- 导航菜单 -->
          <nav class="nav-menu">
            <a href="#" class="nav-item active">首页</a>
            <el-dropdown class="nav-item-dropdown">
              <span class="nav-item el-dropdown-link">
                题库<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <div class="question-bank-info">
                      <h3>Java后端工程师题库</h3>
                      <p class="bank-stats">超过 <strong>1000道</strong> 精选题目</p>
                      <ul class="bank-categories">
                        <li>Java 基础语法与特性</li>
                        <li>JVM 内存模型与调优</li>
                        <li>并发编程与多线程</li>
                        <li>Redis 缓存设计与应用</li>
                        <li>MySQL 数据库设计与优化</li>
                        <li>Spring 框架核心原理</li>
                        <li>微服务架构与分布式</li>
                      </ul>
                      <p class="bank-cta">
                        想要查看完整题库和详细解析？<br>
                        <el-button @click="$router.push('/login')" size="small" type="primary">立即登录</el-button>
                      </p>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-dropdown class="nav-item-dropdown">
              <span class="nav-item el-dropdown-link">
                更多资源<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <div class="resource-item">
                      <a href="https://leetcode.cn/" target="_blank" class="dropdown-link">力扣LeetCode</a>
                      <p class="resource-desc">全球极客挚爱的技术成长平台，提供丰富的算法题库</p>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <div class="resource-item">
                      <a href="https://www.nowcoder.com/" target="_blank" class="dropdown-link">牛客网</a>
                      <p class="resource-desc">专业IT求职备考平台，涵盖笔试面试真题</p>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <div class="resource-item">
                      <a href="https://www.csdn.net/" target="_blank" class="dropdown-link">CSDN</a>
                      <p class="resource-desc">中国专业IT社区，技术文章和问答分享平台</p>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <div class="resource-item">
                      <a href="https://github.com/" target="_blank" class="dropdown-link">GitHub</a>
                      <p class="resource-desc">全球最大的代码托管平台，开源项目协作社区</p>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-dropdown class="nav-item-dropdown">
              <span class="nav-item el-dropdown-link">
                关于我们<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="showAboutDialog = true">平台介绍</el-dropdown-item>
                  <el-dropdown-item @click="showContactDialog = true">联系我们</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </nav>
          
          <!-- 登录注册按钮 -->
          <div class="auth-buttons">
            <el-button @click="$router.push('/login')" type="primary" plain>
              登录
            </el-button>
            <el-button @click="$router.push('/register')" type="primary">
              注册
            </el-button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 横幅区域 -->
        <section class="banner-section">
          <div class="banner-content">
            <h2 class="banner-title">比肩大厂的知识库不怕你学不会</h2>
            <p class="banner-subtitle">从基础到高级，系统学习Java八股文</p>
          </div>
          
          <div class="banner-actions">
            <el-button @click="$router.push('/register')" type="primary" size="large">
              立即开始学习
            </el-button>
            <el-button @click="$router.push('/home')" size="large">
              浏览题库
            </el-button>
          </div>
        </section>

        <!-- 图片展示区域 -->
        <section class="image-showcase">
          <el-carousel height="600px" indicator-position="outside">
            <el-carousel-item v-for="item in carouselImages" :key="item.id">
              <div class="carousel-item-content">
                <img :src="item.src" :alt="item.alt" class="carousel-image">
                <div class="carousel-caption">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </section>

        <!-- 特色功能区域 -->
        <section class="features-section">
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><Collection /></el-icon>
            </div>
            <h3 class="feature-title">全面的题库</h3>
            <p class="feature-desc">涵盖Java基础、JVM、并发编程、Spring框架等核心知识点</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <h3 class="feature-title">智能分析</h3>
            <p class="feature-desc">个性化学习路径推荐，精准定位知识薄弱点</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <h3 class="feature-title">成就系统</h3>
            <p class="feature-desc">丰富的成就徽章，激励持续学习和进步</p>
          </div>
        </section>

        <!-- 数据统计区域 -->
        <section class="stats-section">
          <div class="stat-item">
            <div class="stat-number">200+</div>
            <div class="stat-label">精选八股文</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">5000+</div>
            <div class="stat-label">活跃用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">90%</div>
            <div class="stat-label">面试通过率</div>
          </div>
        </section>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-left">
            <h3>Halo Java八股文</h3>
            <p>专注于Java面试知识学习和练习</p>
          </div>
          <div class="footer-right">
            <p>© 2025 Halo Java八股文 | 用知识点亮未来</p>
          </div>
        </div>
      </div>
    </footer>

    <!-- 关于我们对话框 -->
    <el-dialog v-model="showAboutDialog" title="平台介绍" width="600px">
      <div class="dialog-content">
        <h3>关于Halo刷题网</h3>
        <p>Halo刷题网是一个专业的Java面试题练习平台，致力于帮助开发者系统性地学习和掌握Java核心技术。</p>
        
        <h4>我们的使命</h4>
        <p>通过精心设计的八股文题目和深入的解析，帮助每一位Java开发者在面试中脱颖而出，实现职业发展的突破。</p>
        
        <h4>平台特色</h4>
        <ul>
          <li><strong>全面覆盖</strong>：涵盖Java基础、JVM、并发编程、Spring框架等核心知识点</li>
          <li><strong>智能分析</strong>：个性化学习路径推荐，精准定位知识薄弱点</li>
          <li><strong>实战导向</strong>：题目来源于真实面试场景，贴近实际工作需求</li>
          <li><strong>社区互动</strong>：与 thousands of Java 开发者一起学习交流</li>
        </ul>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAboutDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 联系我们对话框 -->
    <el-dialog v-model="showContactDialog" title="联系我们" width="600px">
      <div class="dialog-content">
        <h3>联系方式</h3>
        <p>如果您有任何问题或建议，欢迎通过以下方式联系我们：</p>
        
        <div class="contact-info">
          <p><strong>邮箱</strong>：17840524165.163.com</p>
          <p><strong>QQ群</strong>：1042663638</p>
          <p><strong>微信公众号</strong>：海明菜园</p>
        </div>
        
        <h4>合作洽谈</h4>
        <p>如果您希望与我们进行商务合作或内容合作，请发送邮件至：hhm3406698893@gmail.com</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showContactDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Collection, DataAnalysis, Trophy, ArrowDown } from '@element-plus/icons-vue'

// 控制对话框显示
const showAboutDialog = ref(false)
const showContactDialog = ref(false)

// 轮播图数据
const carouselImages = ref([
  {
    id: 1,
    src: new URL('@/assets/images/image01.png', import.meta.url).href,
    alt: '学习图片01',
    title: '系统化学习路径',
    description: '跟随我们的学习计划，逐步掌握Java核心技术'
  },
  {
    id: 2,
    src: new URL('@/assets/images/image02.jpg', import.meta.url).href,
    alt: '学习图片02',
    title: '海量题库练习',
    description: '超过1000道精选题目，涵盖各大厂面试真题'
  },
  {
    id: 3,
    src: 'https://picsum.photos/900/500?random=3',
    alt: '学习图片03',
    title: '实时在线评测',
    description: '提交代码即时获得结果反馈，快速提升编程能力'
  },
  {
    id: 4,
    src: 'https://picsum.photos/900/500?random=4',
    alt: '学习图片04',
    title: '智能错题本',
    description: '自动收集错题，针对性复习巩固知识点'
  },
  {
    id: 5,
    src: 'https://picsum.photos/900/500?random=5',
    alt: '学习图片05',
    title: '社区讨论交流',
    description: '与数千名Java开发者共同探讨技术难题'
  }
])
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 头部导航 */
.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.nav-menu {
  display: flex;
  gap: 32px;
  align-items: center;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 16px;
  transition: opacity 0.3s;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.nav-item:hover,
.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-item-dropdown {
  color: white;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.dropdown-link {
  text-decoration: none;
  color: var(--el-dropdown-menuItem-text-color);
  display: block;
  width: 100%;
  height: 100%;
}

.question-bank-info {
  padding: 16px;
  max-width: 300px;
}

.question-bank-info h3 {
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
  font-size: 16px;
}

.bank-stats {
  color: var(--el-text-color-secondary);
  margin: 0 0 12px 0;
  font-size: 14px;
}

.bank-stats strong {
  color: var(--el-color-primary);
  font-size: 16px;
}

.bank-categories {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  padding-left: 16px;
  margin: 0 0 16px 0;
}

.bank-categories li {
  margin-bottom: 6px;
  line-height: 1.4;
}

.bank-cta {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

.resource-item {
  padding: 8px 0;
}

.resource-item .dropdown-link {
  font-weight: 500;
  margin-bottom: 4px;
}

.resource-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.4;
}

/* 主要内容 */
.main-content {
  padding-top: 64px;
}

.banner-section {
  padding: 120px 0 80px;
  text-align: center;
}

.banner-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.banner-subtitle {
  font-size: 24px;
  margin-bottom: 48px;
  opacity: 0.9;
}

.banner-actions {
  display: flex;
  justify-content: center;
  gap: 24px;
}

/* 图片展示区域 */
.image-showcase {
  margin: 40px 0;
}

.carousel-item-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.carousel-caption h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.carousel-caption p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

/* 特色功能 */
.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  padding: 80px 0;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 24px;
}

.feature-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.feature-desc {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.6;
}

/* 数据统计 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  padding: 80px 0;
  text-align: center;
}

.stat-item {
  padding: 32px;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}

.stat-label {
  font-size: 18px;
  opacity: 0.9;
}

/* 页脚 */
.footer {
  background: rgba(0, 0, 0, 0.2);
  padding: 40px 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.footer-left p,
.footer-right p {
  opacity: 0.8;
  margin: 0;
}

/* 对话框内容 */
.dialog-content h3 {
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
}

.dialog-content h4 {
  color: var(--el-text-color-primary);
  margin: 20px 0 10px;
}

.dialog-content p {
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin-bottom: 10px;
}

.dialog-content ul {
  color: var(--el-text-color-secondary);
  padding-left: 20px;
}

.dialog-content li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.contact-info p {
  margin: 8px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu {
    gap: 16px;
  }
  
  .banner-title {
    font-size: 36px;
  }
  
  .banner-subtitle {
    font-size: 18px;
  }
  
  .banner-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .features-section,
  .stats-section {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 40px 0;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .carousel-caption h3 {
    font-size: 20px;
  }
  
  .carousel-caption p {
    font-size: 14px;
  }
}
</style>