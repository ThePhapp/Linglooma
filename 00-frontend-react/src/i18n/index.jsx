import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translations database
const translations = {
  en: {
    // Common
    'welcome': 'Welcome',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'close': 'Close',
    'submit': 'Submit',
    'back': 'Back',
    
    // Auth
    'login': 'Login',
    'signup': 'Sign Up',
    'logout': 'Logout',
    'email': 'Email',
    'password': 'Password',
    'username': 'Username',
    'register': 'Register',
    
    // Sidebar & Navigation
    'dashboard': 'Dashboard',
    'features': 'Features',
    'ai_chat': 'AI Chat',
    'smart_analytics': 'Smart Analytics',
    'settings': 'Settings',
    'main_menu': 'Main Menu',
    'account': 'Account',
    'english_learning_platform': 'English Learning Platform',
    
    // Skills
    'speaking': 'Speaking',
    'listening': 'Listening',
    'reading': 'Reading',
    'writing': 'Writing',
    
    // Practice
    'start_practice': 'Start Practice',
    'practice_now': 'Practice Now',
    'view_history': 'View History',
    'speaking_history': 'Speaking Practice History',
    'no_sessions': 'No speaking practice sessions yet',
    
    // Results
    'your_results': 'Your Results',
    'ielts_band': 'IELTS Band',
    'accuracy': 'Accuracy',
    'fluency': 'Fluency',
    'completeness': 'Completeness',
    'pronunciation': 'Pronunciation',
    'feedback': 'Feedback',
    'view_detailed_feedback': 'View Detailed Feedback',
    
    // Lessons
    'lessons': 'Lessons',
    'lesson': 'Lesson',
    'questions': 'Questions',
    'back_to_lessons': 'Back to Lessons',
  },
  vi: {
    // Common
    'welcome': 'Chào mừng',
    'loading': 'Đang tải...',
    'error': 'Lỗi',
    'success': 'Thành công',
    'save': 'Lưu',
    'cancel': 'Hủy',
    'delete': 'Xóa',
    'edit': 'Sửa',
    'close': 'Đóng',
    'submit': 'Gửi',
    'back': 'Quay lại',
    
    // Auth
    'login': 'Đăng nhập',
    'signup': 'Đăng ký',
    'logout': 'Đăng xuất',
    'email': 'Email',
    'password': 'Mật khẩu',
    'username': 'Tên người dùng',
    'register': 'Đăng ký',
    
    // Sidebar & Navigation
    'dashboard': 'Bảng điều khiển',
    'features': 'Tính năng',
    'ai_chat': 'Trò chuyện AI',
    'smart_analytics': 'Phân tích thông minh',
    'settings': 'Cài đặt',
    'main_menu': 'Menu chính',
    'account': 'Tài khoản',
    'english_learning_platform': 'Nền tảng học tiếng Anh',
    
    // Skills
    'speaking': 'Nói',
    'listening': 'Nghe',
    'reading': 'Đọc',
    'writing': 'Viết',
    
    // Practice
    'start_practice': 'Bắt đầu luyện tập',
    'practice_now': 'Luyện tập ngay',
    'view_history': 'Xem lịch sử',
    'speaking_history': 'Lịch sử luyện nói',
    'no_sessions': 'Chưa có buổi luyện nói nào',
    
    // Results
    'your_results': 'Kết quả của bạn',
    'ielts_band': 'Điểm IELTS',
    'accuracy': 'Độ chính xác',
    'fluency': 'Độ trôi chảy',
    'completeness': 'Độ hoàn chỉnh',
    'pronunciation': 'Phát âm',
    'feedback': 'Phản hồi',
    'view_detailed_feedback': 'Xem phản hồi chi tiết',
    
    // Lessons
    'lessons': 'Bài học',
    'lesson': 'Bài học',
    'questions': 'Câu hỏi',
    'back_to_lessons': 'Quay lại danh sách bài học',
  },
  ja: {
    // Common
    'welcome': 'ようこそ',
    'loading': '読み込み中...',
    'error': 'エラー',
    'success': '成功',
    'save': '保存',
    'cancel': 'キャンセル',
    'delete': '削除',
    'edit': '編集',
    'close': '閉じる',
    'submit': '送信',
    'back': '戻る',
    
    // Auth
    'login': 'ログイン',
    'signup': 'サインアップ',
    'logout': 'ログアウト',
    'email': 'メール',
    'password': 'パスワード',
    'username': 'ユーザー名',
    'register': '登録',
    
    // Sidebar & Navigation
    'dashboard': 'ダッシュボード',
    'features': '機能',
    'ai_chat': 'AIチャット',
    'smart_analytics': 'スマート分析',
    'settings': '設定',
    'main_menu': 'メインメニュー',
    'account': 'アカウント',
    'english_learning_platform': '英語学習プラットフォーム',
    
    // Skills
    'speaking': 'スピーキング',
    'listening': 'リスニング',
    'reading': 'リーディング',
    'writing': 'ライティング',
    
    // Practice
    'start_practice': '練習を始める',
    'practice_now': '今すぐ練習',
    'view_history': '履歴を見る',
    'speaking_history': 'スピーキング練習履歴',
    'no_sessions': 'スピーキング練習セッションがありません',
    
    // Results
    'your_results': 'あなたの結果',
    'ielts_band': 'IELTSバンド',
    'accuracy': '正確性',
    'fluency': '流暢さ',
    'completeness': '完全性',
    'pronunciation': '発音',
    'feedback': 'フィードバック',
    'view_detailed_feedback': '詳細なフィードバックを見る',
    
    // Lessons
    'lessons': 'レッスン',
    'lesson': 'レッスン',
    'questions': '質問',
    'back_to_lessons': 'レッスン一覧に戻る',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'vi';
  });

  useEffect(() => {
    localStorage.setItem('preferredLanguage', lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
