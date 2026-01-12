"use client"

import { Layout } from "@/components/layout/Layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <Tabs defaultValue="ja" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ja">日本語</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="ja" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>1. はじめに</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  SensiLog（以下「本サービス」）は、お客様のプライバシーを尊重し、個人情報の保護に努めています。
                  本プライバシーポリシーは、本サービスがどのような情報を収集し、どのように使用するかについて説明します。
                </p>
                <p className="mt-4">
                  本サービスは、日本の個人情報保護法および関連する法令を遵守し、お客様の個人情報を適切に取り扱います。
                </p>
                <p className="mt-4">
                  本サービスを利用することにより、お客様は本プライバシーポリシーに同意したものとみなされます。
                </p>
                <h4 className="text-lg font-semibold mt-4">運営者情報</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>運営者：株式会社ESG</li>
                  <li>所在地：東京都品川区</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. 収集する情報</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>本サービスは、以下の情報を収集する場合があります：</p>
                <h4 className="text-lg font-semibold mt-4">Riot Gamesアカウント情報</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Riot ID（ゲーム名とタグライン）</li>
                  <li>PUUID（プレイヤー固有識別子）</li>
                  <li>地域情報</li>
                </ul>
                <h4 className="text-lg font-semibold mt-4">ゲームデータ</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>VALORANT試合履歴およびパフォーマンス統計</li>
                  <li>ランク情報</li>
                  <li>プレイ時間</li>
                </ul>
                <h4 className="text-lg font-semibold mt-4">ユーザー入力情報</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>感度設定（DPI、ゲーム内感度、eDPI）</li>
                  <li>デバイス情報（マウス、マウスパッド等）</li>
                  <li>その他ユーザーが入力した設定情報</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. 情報の利用目的</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>収集した情報は、以下の目的で使用されます：</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>本サービスの提供および機能の向上</li>
                  <li>感度設定とパフォーマンスの相関分析</li>
                  <li>ユーザーエクスペリエンスの改善</li>
                  <li>サービスの利用状況の把握</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Riot Games APIについて</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  本サービスは、Riot Games APIを使用してVALORANTのゲームデータを取得しています。
                </p>
                <p className="mt-4">
                  <strong>重要：</strong>本サービスはRiot Gamesが承認したものではなく、
                  Riot Gamesまたは公式にRiot Gamesとパートナーシップを結んでいる者とは関係ありません。
                  VALORANTおよびRiot Gamesは、Riot Games, Inc.の商標または登録商標です。
                </p>
                <p className="mt-4">
                  Riot Sign-On（RSO）を通じて認証を行う場合、お客様はRiot Gamesの利用規約に同意することになります。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. オプトインポリシー（データ公開に関する方針）</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  本サービスは、<strong>オプトイン方式</strong>を採用しています。
                  これは、プレイヤーが自ら本サービスに登録（サインアップ）した場合にのみ、
                  そのプレイヤーのゲームデータや統計情報を表示することを意味します。
                </p>
                <p className="mt-4">
                  <strong>重要：</strong>本サービスに登録していないプレイヤーの情報は、
                  他のユーザーに対して公開されることはありません。
                  これは、ウェブサイト、アプリケーション、およびすべての関連サービスに適用されます。
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-4">
                  <li>プレイヤーは、本サービスへの登録によりデータ公開に同意します</li>
                  <li>未登録のプレイヤーのデータは検索・表示できません</li>
                  <li>登録を解除することで、いつでもデータの公開を停止できます</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. 情報の共有</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  本サービスは、お客様の個人情報を第三者に販売、貸与、または共有することはありません。
                  ただし、以下の場合を除きます：
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>お客様の同意がある場合</li>
                  <li>法律により開示が求められる場合</li>
                  <li>本サービスの権利または財産を保護する必要がある場合</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. データの保持</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  お客様のデータは、サービス提供に必要な期間保持されます。
                  アカウントを削除した場合、関連するすべてのデータは合理的な期間内に削除されます。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. セキュリティ</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  本サービスは、お客様の情報を保護するために適切な技術的・組織的措置を講じています。
                  ただし、インターネット上での送信や電子的保存は完全に安全であることを保証するものではありません。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. ユーザーの権利</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>お客様は、以下の権利を有します：</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>保存されている個人情報へのアクセス</li>
                  <li>個人情報の訂正または削除の要求</li>
                  <li>データ処理への異議申し立て</li>
                </ul>
                <p className="mt-4">
                  これらの権利を行使する場合は、下記のお問い合わせ先までご連絡ください。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. お問い合わせ</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  本プライバシーポリシーに関するご質問やご意見は、以下の連絡先までお願いいたします：
                </p>
                <p className="mt-4">
                  <strong>Email:</strong> sensilog_sup@e-sportsgg.com
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="en" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  SensiLog (&quot;the Service&quot;) respects your privacy and is committed to protecting your personal information.
                  This Privacy Policy explains what information we collect and how we use it.
                </p>
                <p className="mt-4">
                  This Service complies with Japan&apos;s Act on the Protection of Personal Information (APPI) and related laws,
                  and handles your personal information appropriately.
                </p>
                <p className="mt-4">
                  By using the Service, you agree to the terms of this Privacy Policy.
                </p>
                <h4 className="text-lg font-semibold mt-4">Operator Information</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Operator: ESG Inc.</li>
                  <li>Location: Shinagawa-ku, Tokyo, Japan</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>The Service may collect the following information:</p>
                <h4 className="text-lg font-semibold mt-4">Riot Games Account Information</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Riot ID (Game Name and Tagline)</li>
                  <li>PUUID (Player Universally Unique Identifier)</li>
                  <li>Region information</li>
                </ul>
                <h4 className="text-lg font-semibold mt-4">Game Data</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>VALORANT match history and performance statistics</li>
                  <li>Rank information</li>
                  <li>Playtime</li>
                </ul>
                <h4 className="text-lg font-semibold mt-4">User-Provided Information</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Sensitivity settings (DPI, in-game sensitivity, eDPI)</li>
                  <li>Device information (mouse, mousepad, etc.)</li>
                  <li>Other settings entered by the user</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>We use the collected information for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Providing and improving the Service</li>
                  <li>Analyzing correlations between sensitivity settings and performance</li>
                  <li>Improving user experience</li>
                  <li>Understanding service usage patterns</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Riot Games API</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  The Service uses the Riot Games API to retrieve VALORANT game data.
                </p>
                <p className="mt-4">
                  <strong>Important:</strong> This Service is not endorsed by Riot Games and does not reflect
                  the views or opinions of Riot Games or anyone officially involved in producing or managing
                  Riot Games properties. Riot Games and VALORANT are trademarks or registered trademarks of Riot Games, Inc.
                </p>
                <p className="mt-4">
                  When authenticating through Riot Sign-On (RSO), you agree to Riot Games&apos; Terms of Service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Opt-In Policy (Data Visibility)</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  This Service operates on an <strong>opt-in basis</strong>.
                  This means that a player&apos;s game data and statistics will only be displayed
                  if the player has voluntarily registered (signed up) for this Service.
                </p>
                <p className="mt-4">
                  <strong>Important:</strong> Information of players who have not registered for this Service
                  will not be made available to other users.
                  This applies to our website, applications, and all related services.
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-4">
                  <li>Players consent to data visibility by registering for this Service</li>
                  <li>Data of unregistered players cannot be searched or displayed</li>
                  <li>Players can stop data visibility at any time by canceling their registration</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Information Sharing</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  We do not sell, rent, or share your personal information with third parties, except in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>With your consent</li>
                  <li>When required by law</li>
                  <li>To protect the rights or property of the Service</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Your data is retained for as long as necessary to provide the Service.
                  If you delete your account, all associated data will be deleted within a reasonable timeframe.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Security</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  We implement appropriate technical and organizational measures to protect your information.
                  However, no method of transmission over the Internet or electronic storage is completely secure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>You have the following rights:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access to your stored personal information</li>
                  <li>Request correction or deletion of your personal information</li>
                  <li>Object to data processing</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us using the information below.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  If you have any questions or concerns about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-4">
                  <strong>Email:</strong> sensilog_sup@e-sportsgg.com
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
